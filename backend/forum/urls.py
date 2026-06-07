from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AnswerViewSet, PostViewSet

router = DefaultRouter()
router.register(r"forum/posts", PostViewSet, basename="forum-post")
router.register(r"forum/answers", AnswerViewSet, basename="forum-answer")

urlpatterns = [path("", include(router.urls))]

