from __future__ import annotations

import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import AnonymousUser

from .models import Conversation, Message
from .serializers import MessageSerializer


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.close(code=4401)
            return

        self.conversation_id = int(self.scope["url_route"]["kwargs"]["conversation_id"])
        allowed = await self._user_in_conversation(user_id=user.id, conversation_id=self.conversation_id)
        if not allowed:
            await self.close(code=4403)
            return

        self.group_name = f"conversation_{self.conversation_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        user = self.scope["user"]
        payload = json.loads(text_data or "{}")
        body = (payload.get("body") or "").strip()
        if not body:
            return

        msg = await self._create_message(conversation_id=self.conversation_id, sender_id=user.id, body=body)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "message": msg,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    @database_sync_to_async
    def _user_in_conversation(self, *, user_id: int, conversation_id: int) -> bool:
        try:
            conv = Conversation.objects.get(pk=conversation_id)
        except Conversation.DoesNotExist:
            return False
        return user_id in {conv.user1_id, conv.user2_id}

    @database_sync_to_async
    def _create_message(self, *, conversation_id: int, sender_id: int, body: str):
        msg = Message.objects.create(conversation_id=conversation_id, sender_id=sender_id, body=body)
        return MessageSerializer(msg).data

