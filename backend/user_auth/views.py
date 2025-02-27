from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from .serializers import SignupSerializer
from django.contrib.auth import authenticate, login
from .serializers import SigninSerializer
import secrets
import logging
from django.core.mail import send_mail
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework.views import APIView
from .models import PasswordResetRequest

@api_view(['POST'])
def signup(request):
    if request.method == 'POST':
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Пользователь успешно зарегистрирован'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SigninView(APIView):
    def post(self, request):
        serializer = SigninSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logout successful"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        
class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]  # Требует аутентификации

    def get(self, request):
        return Response({"message": "Я смотрю у тебя есть токен. Добро пожаловать, милсдарь"}, status=200)        
    

# RECOVERY // ВОССТАНОВЛЕНИЕ ПАРОЛЯ
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
        reset_url = request.build_absolute_uri(f"/api/v1/auth/reset-password/?token={token}")
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
    
class PasswordResetActivateView(APIView):
    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not token or not new_password:
            return Response({"error": "Token and new password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Находим запрос на сброс пароля по токену
            reset_request = PasswordResetRequest.objects.get(token=token)
        except PasswordResetRequest.DoesNotExist:
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем, что токен не старше 1 часа
        if reset_request.created_at < timezone.now() - timedelta(hours=1):
            return Response({"error": "Token expired"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Обновляем пароль пользователя
        user = reset_request.user
        user.set_password(new_password)  # Устанавливаем новый пароль
        user.save()
        
        # Удаляем запрос на сброс пароля, чтобы токен больше не был использован
        reset_request.delete()

        return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)