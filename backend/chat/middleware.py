from __future__ import annotations

from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.auth import AuthMiddlewareStack

@sync_to_async
def _get_user_from_token(token: str):
    # 👇 move import here (VERY IMPORTANT)
    from rest_framework_simplejwt.authentication import JWTAuthentication

    jwt_auth = JWTAuthentication()
    validated = jwt_auth.get_validated_token(token)
    return jwt_auth.get_user(validated)


class JwtAuthMiddleware:
    """
    JWT auth for Channels WebSockets.
    Pass token in query string: ws://.../?token=<accessToken>
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        qs = parse_qs(scope.get("query_string", b"").decode())
        token = (qs.get("token") or [None])[0]

        if token:
            try:
                scope["user"] = await _get_user_from_token(token)
            except Exception:
                pass  # keep AnonymousUser

        return await self.app(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(AuthMiddlewareStack(inner))