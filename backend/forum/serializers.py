from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Answer, AnswerVote, Post, PostVote, Tag

User = get_user_model()


class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class AnswerSerializer(serializers.ModelSerializer):
    author = UserLiteSerializer(read_only=True)
    vote_score = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ["id", "post", "author", "body", "created_at", "updated_at", "vote_score"]
        read_only_fields = ["id", "author", "created_at", "updated_at", "vote_score"]

    def get_vote_score(self, obj: Answer) -> int:
        return sum(v.value for v in obj.votes.all())


class PostSerializer(serializers.ModelSerializer):
    author = UserLiteSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(child=serializers.CharField(max_length=50), write_only=True, required=False)
    vote_score = serializers.SerializerMethodField()
    answers_count = serializers.IntegerField(source="answers.count", read_only=True)
    best_answer_id = serializers.IntegerField(source="best_answer.id", read_only=True, allow_null=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "title",
            "body",
            "skill",
            "tags",
            "tag_names",
            "best_answer_id",
            "vote_score",
            "answers_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "author", "tags", "best_answer_id", "vote_score", "answers_count", "created_at", "updated_at"]

    def get_vote_score(self, obj: Post) -> int:
        return sum(v.value for v in obj.votes.all())

    def create(self, validated_data):
        tag_names = validated_data.pop("tag_names", [])
        post = super().create(validated_data)
        if tag_names:
            tags = []
            for name in tag_names:
                t, _ = Tag.objects.get_or_create(name=name.strip().lower())
                tags.append(t)
            post.tags.set(tags)
        return post

    def update(self, instance, validated_data):
        tag_names = validated_data.pop("tag_names", None)
        post = super().update(instance, validated_data)
        if tag_names is not None:
            tags = []
            for name in tag_names:
                t, _ = Tag.objects.get_or_create(name=name.strip().lower())
                tags.append(t)
            post.tags.set(tags)
        return post


class VoteSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=[-1, 1])

