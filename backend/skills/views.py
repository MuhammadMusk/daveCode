from rest_framework import viewsets, permissions

from .models import Skill
from .serializers import SkillSerializer


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
