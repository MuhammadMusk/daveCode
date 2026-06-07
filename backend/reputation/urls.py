from django.urls import path

from .views import LeaderboardView

urlpatterns = [
    path("reputation/leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
]

