from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import MatchingViewSet, TutoringRequestViewSet, TutoringSessionViewSet

router = DefaultRouter()
router.register(r"matching/requests", TutoringRequestViewSet, basename="tutoring-request")
router.register(r"matching/sessions", TutoringSessionViewSet, basename="tutoring-session")
router.register(r"matching", MatchingViewSet, basename="matching")

urlpatterns = [path("", include(router.urls))]

