from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import Profile, UserSkill
from skills.models import Skill
from .models import TutoringRequest, TutoringSession

User = get_user_model()


class UserMatchSerializer(serializers.ModelSerializer):
    reputation_points = serializers.IntegerField(source="profile.reputation_points", read_only=True)
    rank = serializers.CharField(source="profile.rank", read_only=True)
    workload = serializers.IntegerField(read_only=True)
    score = serializers.FloatField(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "reputation_points", "rank", "workload", "score"]


class TutoringRequestSerializer(serializers.ModelSerializer):
    requester_username = serializers.CharField(source="requester.username", read_only=True)
    matched_peer_username = serializers.CharField(source="matched_peer.username", read_only=True)

    class Meta:
        model = TutoringRequest
        fields = [
            "id",
            "requester",
            "requester_username",
            "skill",
            "topic",
            "description",
            "status",
            "matched_peer",
            "matched_peer_username",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "requester", "status", "matched_peer", "created_at", "updated_at"]


class TutoringSessionSerializer(serializers.ModelSerializer):
    tutor_username = serializers.CharField(source="tutor.username", read_only=True)
    learner_username = serializers.CharField(source="learner.username", read_only=True)

    class Meta:
        model = TutoringSession
        fields = [
            "id",
            "request",
            "tutor",
            "tutor_username",
            "learner",
            "learner_username",
            "status",
            "rating_by_learner",
            "rating_by_tutor",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

