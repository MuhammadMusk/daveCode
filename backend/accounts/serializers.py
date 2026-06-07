from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Profile, UserSkill
from skills.models import Skill

User = get_user_model()


class SkillLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category"]


class UserSkillSerializer(serializers.ModelSerializer):
    skill = SkillLiteSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(source="skill", queryset=Skill.objects.all(), write_only=True)

    class Meta:
        model = UserSkill
        fields = [
            "id",
            "skill",
            "skill_id",
            "proficiency",
            "can_teach",
            "can_learn",
            "skill_points",
        ]
        read_only_fields = ["id", "skill_points"]


class ProfileSerializer(serializers.ModelSerializer):
    rank = serializers.CharField(read_only=True)

    class Meta:
        model = Profile
        fields = [
            "institution",
            "department",
            "level",
            "location",
            "bio",
            "phone",
            "avatar_url",
            "reputation_points",
            "rank",
        ]
        read_only_fields = ["reputation_points", "rank"]


class MeSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    skills = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile", "skills"]

    def get_skills(self, obj: User):
        qs = obj.user_skills.select_related("skill").all()
        return UserSkillSerializer(qs, many=True).data


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        return user

