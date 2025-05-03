from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view

from ..serializers import SignupSerializer
import logging
from django.core.mail import send_mail
import uuid
from django.core.cache import cache

logger = logging.getLogger(__name__)

@api_view(['POST'])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if not serializer.is_valid():
        errors = serializer.errors
        logger.info(f"Serializer errors: {errors}")
        
        # Проверка ошибок пароля или подтверждения пароля
        if 'password' in errors or 'password_confirmation' in errors:
            return Response(
                {
                    'error': (
                        errors.get('password') or
                        errors.get('password_confirmation') or
                        ['Invalid password format']
                    )
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )
        
        # Проверка ошибок email
        if 'email' in errors:
            # Если ошибка связана с уникальностью
            if any("уже существует" in str(error) for error in errors['email']):
                return Response(
                    {'error': 'Email already registered'},
                    status=status.HTTP_409_CONFLICT
                )
            # Другие ошибки email (например, неверный формат)
            return Response(
                {'error': errors['email']},
                status=status.HTTP_400_BAD_REQUEST
            )

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    token = str(uuid.uuid4())

    try:
        cache.set(f"signup_token:{token}", {'email': email, 'password': password}, timeout=3600)
        logger.info(f"Generated signup token for {email}: {token}")
    except Exception as e:
        logger.error(f"Failed to save to Redis: {str(e)}")
        return Response(
            {'error': 'Temporary server issue, please try again later'},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

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



