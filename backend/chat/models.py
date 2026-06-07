from django.db import models
from django.contrib.auth import get_user_model
from django.db.models import Q, UniqueConstraint

User = get_user_model()


class Conversation(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversations_as_user1")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversations_as_user2")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [UniqueConstraint(fields=["user1", "user2"], name="uniq_conversation_pair")]

    @staticmethod
    def normalized_pair(a: User, b: User):
        return (a, b) if a.id < b.id else (b, a)

    @classmethod
    def get_or_create_between(cls, a: User, b: User):
        u1, u2 = cls.normalized_pair(a, b)
        return cls.objects.get_or_create(user1=u1, user2=u2)

    def participants(self):
        return [self.user1, self.user2]

    def __str__(self) -> str:
        return f"Conversation {self.pk}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self) -> str:
        return f"Msg {self.pk} in conv {self.conversation_id}"
