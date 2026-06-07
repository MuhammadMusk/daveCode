from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import UniqueConstraint

from skills.models import Skill

User = get_user_model()


class Rank(models.TextChoices):
    STARTER = "starter", "Starter"
    INTERMEDIATE = "intermediate", "Intermediate"
    EXPERT = "expert", "Expert"
    PROFESSIONAL = "professional", "Professional"


def points_to_rank(points: int) -> str:
    if points >= 2000:
        return Rank.PROFESSIONAL
    if points >= 1000:
        return Rank.EXPERT
    if points >= 300:
        return Rank.INTERMEDIATE
    return Rank.STARTER


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")

    institution = models.CharField(max_length=180, blank=True, default="")
    department = models.CharField(max_length=180, blank=True, default="")
    level = models.CharField(max_length=50, blank=True, default="")  # e.g. 100L, 200L
    location = models.CharField(max_length=120, blank=True, default="")  # campus/city

    bio = models.TextField(blank=True, default="")
    phone = models.CharField(max_length=40, blank=True, default="")
    avatar_url = models.URLField(blank=True, default="")

    reputation_points = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-reputation_points", "user__username"]

    @property
    def rank(self) -> str:
        return points_to_rank(self.reputation_points)

    def __str__(self) -> str:
        return f"{self.user.username} Profile"


class UserSkill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_skills")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="user_skills")

    proficiency = models.PositiveSmallIntegerField(default=3)  # 1..5
    can_teach = models.BooleanField(default=True)
    can_learn = models.BooleanField(default=False)

    # reputation for this specific skill area (used by matching)
    skill_points = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            UniqueConstraint(fields=["user", "skill"], name="uniq_user_skill"),
        ]
        ordering = ["-skill_points", "-proficiency"]

    def __str__(self) -> str:
        return f"{self.user.username} - {self.skill.name}"
