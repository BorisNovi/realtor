from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.utils import timezone
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
from datetime import timedelta
import secrets
from users.models import User, PasswordResetRequest
from rest_framework.response import Response
from rest_framework import status

class PasswordRecoveryView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        validator = EmailValidator()
        try:
            validator(email)
        except ValidationError:
            return Response({"error": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)

        # Генерация токена
        token = secrets.token_urlsafe(32)
        PasswordResetRequest.objects.create(user=user, token=token)

        # Ссылка на фронт
        reset_url = request.build_absolute_uri(f"/auth/password-reset-activate/?token={token}")

        send_mail(
            "Password Reset Request",
            f"To reset your password, click the following link: {reset_url}",
            "no-reply@example.com",
            [email],
            fail_silently=False,
        )

        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)


class PasswordResetActivateView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("password")

        if not token or not new_password:
            return Response({"error": "Token and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_request = PasswordResetRequest.objects.get(token=token)
        except PasswordResetRequest.DoesNotExist:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        # Проверка на срок действия токена (1 час)
        if reset_request.created_at < timezone.now() - timedelta(hours=1):
            return Response({"error": "Token expired"}, status=status.HTTP_400_BAD_REQUEST)

        # Обновляем пароль
        user = reset_request.user
        user.set_password(new_password)
        user.save()

        reset_request.delete()  # удаляем использованный токен

        return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)
