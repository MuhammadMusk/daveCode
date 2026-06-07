from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import MeView, ProfileUpdateView, RegisterView, UserSkillViewSet

router = DefaultRouter()
router.register(r"user-skills", UserSkillViewSet, basename="user-skill")

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("me/profile/", ProfileUpdateView.as_view(), name="me_profile"),
    path("", include(router.urls)),
]

