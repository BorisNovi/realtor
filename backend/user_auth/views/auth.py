from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from ..serializers import SignupSerializer
from ..serializers import SigninSerializer
import logging
from django.core.mail import send_mail
from rest_framework.views import APIView
import uuid
from django.core.cache import cache

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
