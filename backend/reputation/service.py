from __future__ import annotations

from dataclasses import dataclass

from django.contrib.auth import get_user_model
from django.db import transaction

from accounts.models import Profile, UserSkill
from skills.models import Skill

User = get_user_model()


@dataclass(frozen=True)
class ReputationConfig:
    upvote_points: int = 5
    downvote_points: int = -2
    best_answer_points: int = 25
    completed_session_base: int = 20


CONFIG = ReputationConfig()


def _add_points(user: User, skill: Skill | None, delta: int) -> None:
    if delta == 0:
        return
    with transaction.atomic():
        profile = Profile.objects.select_for_update().get(user=user)
        profile.reputation_points = int(profile.reputation_points) + int(delta)
        profile.save(update_fields=["reputation_points"])

        if skill is not None:
            us, _ = UserSkill.objects.select_for_update().get_or_create(
                user=user,
                skill=skill,
                defaults={"proficiency": 3, "can_teach": True, "can_learn": False},
            )
            us.skill_points = int(us.skill_points) + int(delta)
            us.save(update_fields=["skill_points"])


def award_for_vote(*, target_author: User, skill: Skill | None, value: int, created: bool) -> None:
    # Keep it simple: only award when vote is first created (prevents farming by toggling).
    if not created:
        return
    delta = CONFIG.upvote_points if value == 1 else CONFIG.downvote_points
    _add_points(target_author, skill, delta)


def award_for_best_answer(*, answer_author: User, skill: Skill | None) -> None:
    _add_points(answer_author, skill, CONFIG.best_answer_points)


def award_for_completed_session(*, tutor: User, skill: Skill, rating_by_learner: int | None) -> None:
    delta = CONFIG.completed_session_base
    if rating_by_learner is not None:
        # small bonus for higher quality sessions
        delta += max(0, int(rating_by_learner) - 3) * 5
    _add_points(tutor, skill, delta)

