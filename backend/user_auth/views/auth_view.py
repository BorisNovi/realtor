# user_auth/views/signup_view.py
from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from ..serializers import SignupSerializer, SigninSerializer
from django.core.cache import cache
from django.db import IntegrityError
import uuid
from django.core.mail import send_mail


User = get_user_model()
CACHE_TIMEOUT = 3600 # 1 hour

class AuthViewSet(viewsets.GenericViewSet):
    """Регистрация и логин пользователей через email и password"""
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
        """Регистрация нового пользователя с подтверждением по email"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_data = serializer.validated_data
        email = user_data['email']

        # Генерация токена активации
        token = str(uuid.uuid4())
        cache.set(f"signup_token:{token}", user_data, timeout=CACHE_TIMEOUT)

        # Формируем ссылку активации
        activation_link = request.build_absolute_uri(f"/auth/activate/?token={token}")

        try:
            send_mail(
                subject="Подтверждение регистрации",
                message=f"Нажмите ссылку для активации аккаунта: {activation_link}",
                from_email="noreply@example.com",
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
        """Активация аккаунта по токену из письма"""
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        user_data = cache.get(f"signup_token:{token}")
        if not user_data or 'email' not in user_data or 'password' not in user_data:
            return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.create_user(
                email=user_data['email'],
                password=user_data['password'],
                name=user_data.get('name', ''),
                company_name=user_data.get('company_name', ''),
                company_logo=user_data.get('company_logo', ''),
            )
            cache.delete(f"signup_token:{token}")

            refresh = RefreshToken.for_user(user)
            return Response({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'role': user.role,
                    'company_name': user.company_name,
                    'company_logo': user.company_logo,
                    'date_added': user.date_added.isoformat(),
                    'banned_at': user.banned_at.isoformat() if user.banned_at else None
                },
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh)
            }, status=status.HTTP_201_CREATED)

        except IntegrityError:
            return Response({'error': 'Email is already registered'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Failed to create user: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def sign_in(self, request):
        """Авторизация пользователя"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        access = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']

        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'company_name': user.company_name,
                'company_logo': user.company_logo,
                'date_added': user.date_added.isoformat(),
                'banned_at': user.banned_at.isoformat() if user.banned_at else None
            },
            'access_token': access,
            'refresh_token': refresh
        }, status=status.HTTP_200_OK)


