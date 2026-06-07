from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import UniqueConstraint

from skills.models import Skill

User = get_user_model()


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self) -> str:
        return self.name


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forum_posts")
    title = models.CharField(max_length=200)
    body = models.TextField()

    # Optional: link to a skill/subject area for matching & reputation
    skill = models.ForeignKey(Skill, null=True, blank=True, on_delete=models.SET_NULL, related_name="forum_posts")
    tags = models.ManyToManyField(Tag, blank=True, related_name="posts")

    best_answer = models.OneToOneField(
        "Answer",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="best_for_post",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Answer(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="answers")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="forum_answers")
    body = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Answer by {self.author.username}"


class PostVote(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="votes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post_votes")
    value = models.SmallIntegerField()  # +1 upvote, -1 downvote
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [UniqueConstraint(fields=["post", "user"], name="uniq_post_vote")]


class AnswerVote(models.Model):
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name="votes")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="answer_votes")
    value = models.SmallIntegerField()  # +1 or -1
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [UniqueConstraint(fields=["answer", "user"], name="uniq_answer_vote")]
