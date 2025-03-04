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
import uuid
from django.core.cache import cache
from django.db import IntegrityError
from django.contrib.auth import get_user_model 


logger = logging.getLogger(__name__)

@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    token = str(uuid.uuid4())

    # Сохраняем в Redis с TTL 1 час (3600 сек)
    cache.set(f"signup_token:{token}", {'email': email, 'password': password}, timeout=3600)
    logger.info(f"Generated signup token for {email}: {token}")

    # Формируем ссылку динамически
    activation_link = request.build_absolute_uri(f"/api/sign-up-activate/?token={token}")

    try:
        send_mail(
            "Подтверждение регистрации",
            f"Перейдите по ссылке для активации: {activation_link}",
            "noreply@example.com",
            [email],
            fail_silently=False,
        )
        logger.info(f"Activation email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return Response(
            {'error': 'Failed to send confirmation email'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return Response(
        {'message': 'Confirmation link has been sent to your email'},
        status=status.HTTP_202_ACCEPTED
    )

User = get_user_model()  # Получаем активную модель пользователя

@api_view(['POST'])
def signup_activate(request):
    token = request.data.get('token')  # Получаем токен из тела запроса
    if not token:
        return Response(
            {'error': 'Token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user_data = _get_user_data_from_cache(token)
    if not user_data:
        return Response(
            {'error': 'Invalid or expired token'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = _create_user(user_data) # Создаём пользователя
        refresh = RefreshToken.for_user(user) # Генерируем JWT токены
        cache.delete(f"signup_token:{token}") # Удаляем токен из кеша после использования
        
        # Формируем ответ с токенами и данными о пользователе
        response_data = {
            "accessToken": str(refresh.access_token),
            "refreshToken": str(refresh),
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "insertedAt": user.insertedAt.isoformat(),
                "bannedAt": user.banned.isoformat() if user.banned else None
            }
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    except IntegrityError:
        return Response(
            {'error': 'Email is already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to create user: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def _get_user_data_from_cache(token): # Извлекаем данные пользователя из кэша и проверяет их
    user_data = cache.get(f"signup_token:{token}")
    if not user_data or 'email' not in user_data or 'password' not in user_data:
        return None
    return user_data

def _create_user(user_data): # Создаём пользователя в базе данных
    return User.objects.create_user(
        email=user_data['email'],
        password=user_data['password']
    )

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
    
class PasswordResetActivateView(APIView):
    def post(self, request):
        token = request.data.get("token")
        password = request.data.get("password")

        if not token or not password:
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
        user.set_password(password)  # Устанавливаем новый пароль
        user.save()
        
        # Удаляем запрос на сброс пароля, чтобы токен больше не был использован
        reset_request.delete()

        return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)