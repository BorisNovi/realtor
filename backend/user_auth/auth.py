# user_auth/auth.py

from datetime import datetime, timezone as dt_timezone
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication

class KillSwitchJWTAuthentication(JWTAuthentication):
    """
    Кастомный authentication class для мгновенного кика пользователя
    после logout_all. Работает только с access-токенами.
    Refresh токены пропускаются (но их нужно блэклистить отдельно).
    """

    def get_user(self, validated_token):
        # НЕ трогаем refresh токены
        if validated_token.token_type != "access":
            return super().get_user(validated_token)

        user = super().get_user(validated_token)

        # Если был глобальный logout — сразу ревоким access
        if user.last_logout_at:
            token_iat = datetime.fromtimestamp(
                validated_token["iat"],
                tz=dt_timezone.utc  # исправлено, а не timezone.utc
            )
            if token_iat < user.last_logout_at:
                raise AuthenticationFailed("Token revoked")

        return user
