from django.contrib.auth import get_user_model
from django.db.models import Count, F, IntegerField, OuterRef, Subquery, Value
from django.db.models.functions import Coalesce
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.models import UserSkill
from reputation.service import award_for_completed_session
from .models import RequestStatus, SessionStatus, TutoringRequest, TutoringSession
from .serializers import TutoringRequestSerializer, TutoringSessionSerializer, UserMatchSerializer

User = get_user_model()


class TutoringRequestViewSet(viewsets.ModelViewSet):
    serializer_class = TutoringRequestSerializer

    def get_queryset(self):
        # show user’s requests + those matched to them
        u = self.request.user
        return TutoringRequest.objects.filter(requester=u) | TutoringRequest.objects.filter(matched_peer=u)

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=["post"])
    def match(self, request, pk=None):
        tr = self.get_object()
        if tr.requester_id != request.user.id:
            return Response({"detail": "Only requester can match."}, status=403)
        peer_id = request.data.get("peer_id")
        try:
            peer = User.objects.get(id=peer_id)
        except User.DoesNotExist:
            return Response({"detail": "Peer not found."}, status=404)
        tr.matched_peer = peer
        tr.status = RequestStatus.MATCHED
        tr.save(update_fields=["matched_peer", "status"])
        session = TutoringSession.objects.create(request=tr, tutor=peer, learner=tr.requester)
        return Response(TutoringSessionSerializer(session).data, status=201)


class TutoringSessionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TutoringSessionSerializer

    def get_queryset(self):
        u = self.request.user
        return TutoringSession.objects.filter(tutor=u) | TutoringSession.objects.filter(learner=u)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        session = self.get_object()
        if request.user.id not in {session.tutor_id, session.learner_id}:
            return Response({"detail": "Not allowed."}, status=403)
        rating = request.data.get("rating_by_learner")
        if request.user.id == session.learner_id and rating is not None:
            session.rating_by_learner = int(rating)
        if request.user.id == session.tutor_id and request.data.get("rating_by_tutor") is not None:
            session.rating_by_tutor = int(request.data["rating_by_tutor"])
        session.status = SessionStatus.COMPLETED
        session.save()
        session.request.status = RequestStatus.COMPLETED
        session.request.save(update_fields=["status"])

        # reputation award to tutor
        award_for_completed_session(tutor=session.tutor, skill=session.request.skill, rating_by_learner=session.rating_by_learner)
        return Response({"ok": True})


class MatchingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=["get"])
    def suggest(self, request):
        skill_id = request.query_params.get("skill_id")
        if not skill_id:
            return Response({"detail": "skill_id is required."}, status=400)

        qs = (
            UserSkill.objects.filter(skill_id=skill_id, can_teach=True)
            .exclude(user=request.user)
            .select_related("user", "user__profile")
        )

        # Workload: active sessions as tutor
        workload_subq = (
            TutoringSession.objects.filter(tutor=OuterRef("user_id"), status=SessionStatus.ACTIVE)
            .values("tutor")
            .annotate(c=Count("id"))
            .values("c")[:1]
        )

        candidates = (
            qs.annotate(workload=Coalesce(Subquery(workload_subq, output_field=IntegerField()), Value(0)))
            .annotate(
                score=(
                    F("skill_points") * 1.0
                    + F("user__profile__reputation_points") * 0.1
                    + F("proficiency") * 10.0
                    - F("workload") * 15.0
                )
            )
            .order_by("-score")[:10]
        )

        users = [c.user for c in candidates]
        by_id = {u.id: u for u in users}
        for c in candidates:
            u = by_id[c.user_id]
            u.workload = int(c.workload)
            u.score = float(c.score)
        return Response(UserMatchSerializer(users, many=True).data)
