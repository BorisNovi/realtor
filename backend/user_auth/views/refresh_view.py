from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny  # Для отключения проверки прав

class RefreshTokenView(APIView):
    authentication_classes = []  # Отключаем JWTAuthentication
    permission_classes = [AllowAny]  # Разрешаем доступ без аутентификации
    
    def post(self, request):
        user_id = request.data.get('id')
        auth_header = request.headers.get('Authorization')

        if not user_id:
            return Response({'error': 'Missing userId in request body'}, status=400)
        if not auth_header:
            return Response({'error': 'Missing Authorization header'}, status=400)

        if not auth_header.startswith('Bearer '):
            return Response({'error': 'Invalid Authorization header'}, status=status.HTTP_400_BAD_REQUEST)

        refresh_token = auth_header.split(' ')[1]
        print("Received token:", refresh_token)  # Отладочный вывод

        try:
            refresh = RefreshToken(refresh_token)
            print("Token payload:", refresh.payload)  # Выводим содержимое токена
            user = get_user_model().objects.get(id=user_id)

            if str(refresh['user_id']) != str(user_id):
                return Response({'error': 'Token does not belong to this user'}, status=status.HTTP_400_BAD_REQUEST)

            # access_token = refresh.access_token
            session_user = {
            "accessToken": str(refresh.access_token),
            "refreshToken": str(refresh),
                "user": {
                    "id": user.id,  # ID пользователя
                    "name": user.name,  # Имя пользователя
                    "email": user.email,  # Почта пользователя
                    "role": user.role,  # Роль пользователя
                    "date_added": user.date_added.isoformat(),  # Дата регистрации
                    "bannedAt": user.banned.isoformat() if user.banned else None  # Дата бана (если есть)
                }
        }
            return Response(session_user, status=status.HTTP_200_OK)

        except TokenError as e:
            print("Token error:", str(e))  # Выводим точную ошибку
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)