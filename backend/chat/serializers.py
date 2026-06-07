from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Conversation, Message

User = get_user_model()


class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]


class ConversationSerializer(serializers.ModelSerializer):
    user1 = UserLiteSerializer(read_only=True)
    user2 = UserLiteSerializer(read_only=True)
    peer = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ["id", "user1", "user2", "peer", "created_at"]
        read_only_fields = fields

    def get_peer(self, obj: Conversation):
        request = self.context.get("request")
        if not request:
            return None
        me = request.user
        peer = obj.user2 if obj.user1_id == me.id else obj.user1
        return UserLiteSerializer(peer).data


class MessageSerializer(serializers.ModelSerializer):
    sender = UserLiteSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "body", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]

