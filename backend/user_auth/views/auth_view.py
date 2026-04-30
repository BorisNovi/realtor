import uuid
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError
from django.core.cache import cache
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings

from user_auth.serializers.user_response import UserResponseSerializer
from ..serializers import SignupSerializer, SigninSerializer

User = get_user_model()
CACHE_TIMEOUT = 3600 # 1 hour

# Хелпер для шаблона ответа
def build_auth_response(user, access_token, refresh_token, status_code=status.HTTP_200_OK):
    return Response({
        'user': UserResponseSerializer(user).data,
        'access_token': access_token,
        'refresh_token': refresh_token,
    }, status=status_code)

class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]

    serializer_classes = {
        'sign_up': SignupSerializer,
        'sign_in': SigninSerializer,
    }

    def get_serializer_class(self):
        return self.serializer_classes.get(self.action, SignupSerializer)

    @action(detail=False, methods=['post'])
    def sign_up(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_data = serializer.validated_data
        email = user_data['email']

        token = str(uuid.uuid4())
        cache.set(f"signup_token:{token}", user_data, timeout=CACHE_TIMEOUT)

        activation_link = f"{settings.FRONTEND_URL}/auth/sign-up?token={token}"

        try:
            send_mail(
                subject="Подтверждение регистрации",
                message=f"Нажмите ссылку для активации аккаунта: {activation_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            print("EMAIL ERROR:", str(e))
            raise


        return Response(
            {'message': 'Если email зарегистрирован, вы получите письмо с подтверждением.'},
            status=status.HTTP_202_ACCEPTED
        )

    @action(detail=False, methods=['post'])
    def sign_up_activate(self, request):
        token = request.data.get('token')
        if not token:
            return Response({'error': 'TOKEN_IS_REQUIRED'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = cache.get(f"signup_token:{token}")
        if not user_data or 'email' not in user_data or 'password' not in user_data:
            return Response({'error': 'INVALID_TOKEN'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                company_name=user_data.get('company_name', ''),
                company_logo=user_data.get('company_logo', ''),
            )
            cache.delete(f"signup_token:{token}")

            refresh = RefreshToken.for_user(user)
            return build_auth_response(
                user,
                access_token=str(refresh.access_token),
                refresh_token=str(refresh),
                status_code=status.HTTP_201_CREATED
            )
    
        except IntegrityError:
            return Response({'error': 'EMAIL_ALREADY_REGISTERED'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def sign_in(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        return build_auth_response(
            user,
            access_token=serializer.validated_data['access'],
            refresh_token=serializer.validated_data['refresh'],
        )


