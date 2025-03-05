from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
import secrets
import logging
from django.core.mail import send_mail
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from users.models import PasswordResetRequest
from django.contrib.auth import get_user_model

User = get_user_model()

# ВОССТАНОВЛЕНИЕ ПАРОЛЯ
logger = logging.getLogger(__name__)
class PasswordRecoveryView(APIView):
    def post(self, request):
        email = request.data.get("email")
        
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Валидация формата email
        validator = EmailValidator()
        try:
            validator(email)
        except ValidationError:
            return Response({"error": "Invalid email format"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
        # # Проверка на существующий запрос
        # existing_request = PasswordResetRequest.objects.filter(
        #     user=user, created_at__gte=timezone.now() - timedelta(hours=1)
        # ).first()
        # if existing_request:
        #     return Response({"error": "Reset request already sent recently"}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        
        # Генерация безопасного токена
        token = secrets.token_urlsafe(32)
        
        # Сохранение запроса в базе
        PasswordResetRequest.objects.create(user=user, token=token)
        
        # Формирование URL и отправка email
        reset_url = request.build_absolute_uri(f"/api/v1/auth/recover-activate/?token={token}")
        try:
            send_mail(
                "Password Reset Request",
                f"To reset your password, click the following link: {reset_url}",
                "no-reply@example.com",
                [email],
                fail_silently=False,
            )
            logger.info(f"Password reset email sent to {email}")
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {str(e)}")
            return Response({"error": "Failed to send email"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)

