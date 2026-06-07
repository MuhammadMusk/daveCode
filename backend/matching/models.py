from django.db import models
from django.contrib.auth import get_user_model

from skills.models import Skill

User = get_user_model()


class RequestStatus(models.TextChoices):
    OPEN = "open", "Open"
    MATCHED = "matched", "Matched"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class TutoringRequest(models.Model):
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tutoring_requests")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="tutoring_requests")
    topic = models.CharField(max_length=200, blank=True, default="")
    description = models.TextField(blank=True, default="")

    status = models.CharField(max_length=16, choices=RequestStatus.choices, default=RequestStatus.OPEN)
    matched_peer = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="matched_tutoring_requests",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]


class SessionStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"
    CANCELLED = "cancelled", "Cancelled"


class TutoringSession(models.Model):
    request = models.OneToOneField(TutoringRequest, on_delete=models.CASCADE, related_name="session")
    tutor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tutoring_sessions_as_tutor")
    learner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tutoring_sessions_as_learner")
    status = models.CharField(max_length=16, choices=SessionStatus.choices, default=SessionStatus.ACTIVE)

    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    rating_by_learner = models.PositiveSmallIntegerField(null=True, blank=True)  # 1..5
    rating_by_tutor = models.PositiveSmallIntegerField(null=True, blank=True)  # 1..5

    created_at = models.DateTimeField(auto_now_add=True)
