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

logger = logging.getLogger(__name__)
User = get_user_model()

# Constants
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
        errors = serializer.errors
        logger.info(f"Serializer errors: {errors}")

        # Обработка ошибок пароля
        if 'password' in errors or 'password_confirmation' in errors:
            password_error = errors.get('password') or errors.get('password_confirmation')
            error_data = extract_error(password_error)
            return Response(
                {'error': error_data['message'], 'code': error_data['code']},
                status=HTTP_422_UNPROCESSABLE_ENTITY
            )

        # Обработка ошибок email
        if 'email' in errors:
            email_error = extract_error(errors['email'])
            return Response(
                {'error': email_error['message'], 
                'code': email_error['code']},
                status=HTTP_400_BAD_REQUEST
            )

        # Прочие ошибки валидации
        return Response(
            {'error': 'Validation failed', 'details': errors},
            status=HTTP_400_BAD_REQUEST
        )


    email = serializer.validated_data['email']
    password = serializer.validated_data['password']

    existing_user = User.objects.filter(email=email).first()
    if existing_user:
        if existing_user.is_active:
            logger.info(f"Signup attempt for already active user: {email}")

            return Response(
                {'message': 'If this email is registered, you will receive a confirmation email.'},
                status=HTTP_202_ACCEPTED
            )
        else:
            logger.info(f"Signup attempt for inactive user, resending activation: {email}")
            # Здесь можно либо переиспользовать старый токен, либо сгенерировать новый
            # Для простоты — генерируем новый и перезаписываем в Redis
    else:
        logger.info(f"New signup attempt: {email}")

    # Генерация и сохранение токена
    token = str(uuid.uuid4())
    try:
        cache.set(f"signup_token:{token}", {'email': email, 'password': password}, timeout=CACHE_TIMEOUT)
        logger.info(f"Generated signup token for {email}: {token}")
    except Exception as e:
        logger.error(f"Failed to save to Redis: {str(e)}")
        return Response(
            {'error': 'Temporary server issue', 'code': 'cache_error'},
            status=HTTP_503_SERVICE_UNAVAILABLE
        )

    # Отправка письма
    activation_link = request.build_absolute_uri(f"/api/sign-up-activate/?token={token}")
    try:
        send_mail(
            subject="Registration Confirmation",
            message=f"Click the link to activate your account: {activation_link}",
            from_email="noreply@example.com",
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f"Activation email sent to {email}")
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        return Response(
            {'error': 'Failed to send confirmation email', 'code': 'email_send_failed'},
            status=HTTP_500_INTERNAL_SERVER_ERROR
        )

    # Финальный ответ всегда одинаков
    return Response(
        {'message': 'If this email is registered, you will receive a confirmation email.'},
        status=HTTP_202_ACCEPTED
    )
