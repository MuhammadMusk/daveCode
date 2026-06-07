from django.contrib.auth import get_user_model
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

User = get_user_model()


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = (
            User.objects.select_related("profile")
            .order_by("-profile__reputation_points", "username")
            .only("id", "username", "profile__reputation_points")
        )[:50]
        data = [
            {
                "id": u.id,
                "username": u.username,
                "reputation_points": int(getattr(u.profile, "reputation_points", 0) or 0),
                "rank": getattr(u.profile, "rank", "starter"),
            }
            for u in qs
        ]
        return Response(data)
