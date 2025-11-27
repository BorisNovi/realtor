# user_auth/views/signup_view.py
import logging
import uuid
from rest_framework import status
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.core.cache import cache
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from ..serializers import SignupSerializer
from django.contrib.auth.hashers import make_password

logger = logging.getLogger(__name__)
User = get_user_model()

# Тест констант для кэша и HTTP-статусов
CACHE_TIMEOUT = 3600  # 1 hour
HTTP_400_BAD_REQUEST = status.HTTP_400_BAD_REQUEST
HTTP_422_UNPROCESSABLE_ENTITY = status.HTTP_422_UNPROCESSABLE_ENTITY
HTTP_500_INTERNAL_SERVER_ERROR = status.HTTP_500_INTERNAL_SERVER_ERROR
HTTP_503_SERVICE_UNAVAILABLE = status.HTTP_503_SERVICE_UNAVAILABLE
HTTP_202_ACCEPTED = status.HTTP_202_ACCEPTED

def extract_error(error):
    """Извлекает первую ошибку из списка или словаря."""
    if isinstance(error, list) and error:
        return {'message': str(error[0]), 'code': 'validation_error'}
    elif isinstance(error, dict):
        return {
            'message': error.get('message', 'Validation error'),
            'code': error.get('code', 'validation_error')
        }
    return {'message': 'Validation error', 'code': 'validation_error'}


@api_view(['POST'])
@authentication_classes([])  # если нужно отключить JWT-проверку
@permission_classes([permissions.AllowAny])  # разрешаем всем
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        print("[DEBUG] Serializer errors:", serializer.errors)
        return Response({'errors': serializer.errors}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    # Хешируем пароль
    hashed_password = make_password(password)
    print(f"[DEBUG] Original password: {password}")
    print(f"[DEBUG] Hashed password: {hashed_password}")

    token = str(uuid.uuid4())
    cache_data = {'email': email, 'password': hashed_password}

    try:
        # Сохраняем в кэш, будь то Redis или LocMemCache
        cache.set(f"signup_token:{token}", cache_data, timeout=CACHE_TIMEOUT)
        print(f"[DEBUG] Cached signup token: {token} with data: {cache_data}")
    except Exception as e:
        print(f"[DEBUG] Failed to save to cache: {str(e)}")
        return Response({'error': 'Temporary server issue', 'code': 'cache_error'},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE)

    # Отправка письма TODO: заменить ссылку на реальный фронтенд
    activation_link = request.build_absolute_uri(f"/api/sign-up-activate?token={token}")
    try:
        send_mail(
            subject="Registration Confirmation",
            message=f"Click the link to activate your account: {activation_link}",
            from_email="noreply@example.com",
            recipient_list=[email],
            fail_silently=False,
        )
        print(f"[DEBUG] Activation email sent to {email}")
    except Exception as e:
        print(f"[DEBUG] Failed to send email: {str(e)}")
        return Response({'error': 'Failed to send confirmation email', 'code': 'email_send_failed'},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'message': 'If this email is registered, you will receive a confirmation email.'},
                    status=status.HTTP_202_ACCEPTED)