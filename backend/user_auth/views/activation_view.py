from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView
from users.models import PasswordResetRequest
from django.core.cache import cache
from django.db import IntegrityError
from rest_framework import status, permissions
from django.contrib.auth import get_user_model 
from rest_framework.decorators import api_view, permission_classes, authentication_classes

User = get_user_model()  # Получаем активную модель пользователя

# АКТИВАЦИЯ РЕГИСТРАЦИИ
@api_view(['POST'])
@authentication_classes([])  # если нужно отключить JWT-проверку
@permission_classes([permissions.AllowAny])  # разрешаем всем
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
                "dateAdded": user.date_added.isoformat(),
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

# АКТИВАЦИЯ СБРОСА ПАРОЛЯ
class PasswordResetActivateView(APIView):
    authentication_classes = []  # <- отключаем проверку токена
    permission_classes = [permissions.AllowAny]  # <- любой может вызвать
    
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