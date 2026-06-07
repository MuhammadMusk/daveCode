from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

User = get_user_model()


class ConversationViewSet(viewsets.ViewSet):
    def list(self, request):
        me = request.user
        qs = Conversation.objects.filter(Q(user1=me) | Q(user2=me)).select_related("user1", "user2")
        return Response(ConversationSerializer(qs, many=True, context={"request": request}).data)

    def create(self, request):
        peer_id = request.data.get("peer_id")
        try:
            peer = User.objects.get(id=peer_id)
        except User.DoesNotExist:
            return Response({"detail": "Peer not found."}, status=404)
        conv, _ = Conversation.get_or_create_between(request.user, peer)
        return Response(ConversationSerializer(conv, context={"request": request}).data, status=201)

    def retrieve(self, request, pk=None):
        me = request.user
        try:
            conv = Conversation.objects.select_related("user1", "user2").get(pk=pk)
        except Conversation.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        if me.id not in {conv.user1_id, conv.user2_id}:
            return Response({"detail": "Not allowed."}, status=403)
        return Response(ConversationSerializer(conv, context={"request": request}).data)

    @action(detail=True, methods=["get", "post"])
    def messages(self, request, pk=None):
        me = request.user
        try:
            conv = Conversation.objects.get(pk=pk)
        except Conversation.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        if me.id not in {conv.user1_id, conv.user2_id}:
            return Response({"detail": "Not allowed."}, status=403)

        if request.method == "GET":
            qs = conv.messages.select_related("sender").all()
            return Response(MessageSerializer(qs, many=True).data)

        ser = MessageSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        msg = Message.objects.create(conversation=conv, sender=me, body=ser.validated_data["body"])
        return Response(MessageSerializer(msg).data, status=201)
