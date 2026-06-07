from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Answer, AnswerVote, Post, PostVote
from .serializers import AnswerSerializer, PostSerializer, VoteSerializer
from reputation.service import award_for_best_answer, award_for_vote


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related("author", "skill", "best_answer").prefetch_related("tags", "votes", "answers").all()
    serializer_class = PostSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=["get", "post"])
    def answers(self, request, pk=None):
        post = self.get_object()
        if request.method == "GET":
            qs = post.answers.select_related("author").prefetch_related("votes").all()
            return Response(AnswerSerializer(qs, many=True).data)
        ser = AnswerSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save(post=post, author=request.user)
        return Response(ser.data, status=201)

    @action(detail=True, methods=["post"])
    def vote(self, request, pk=None):
        post = self.get_object()
        ser = VoteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        value = int(ser.validated_data["value"])
        vote, created = PostVote.objects.update_or_create(post=post, user=request.user, defaults={"value": value})
        award_for_vote(target_author=post.author, skill=post.skill, value=value, created=created)
        return Response({"ok": True, "value": vote.value})

    @action(detail=True, methods=["post"])
    def set_best_answer(self, request, pk=None):
        post = self.get_object()
        if post.author_id != request.user.id:
            return Response({"detail": "Only the post author can select best answer."}, status=403)
        answer_id = request.data.get("answer_id")
        try:
            answer = Answer.objects.get(id=answer_id, post=post)
        except Answer.DoesNotExist:
            return Response({"detail": "Answer not found for this post."}, status=404)
        post.best_answer = answer
        post.save(update_fields=["best_answer"])
        award_for_best_answer(answer_author=answer.author, skill=post.skill)
        return Response({"ok": True, "best_answer_id": answer.id})


class AnswerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Answer.objects.select_related("author", "post", "post__skill").prefetch_related("votes").all()
    serializer_class = AnswerSerializer

    @action(detail=True, methods=["post"])
    def vote(self, request, pk=None):
        answer = self.get_object()
        ser = VoteSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        value = int(ser.validated_data["value"])
        vote, created = AnswerVote.objects.update_or_create(answer=answer, user=request.user, defaults={"value": value})
        award_for_vote(target_author=answer.author, skill=answer.post.skill, value=value, created=created)
        return Response({"ok": True, "value": vote.value})
