from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model
from user_auth.serializers.user_response import UserResponseSerializer
from user_auth.views.auth_view import build_auth_response

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        user_id = request.data.get('id')
        auth_header = request.headers.get('Authorization')

        if not user_id:
            return Response({'MISSING_USER_ID'}, status=400)
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'INVALID_AUTH_HEADER'}, status=400)

        refresh_token = auth_header.split(' ')[1]

        try:
            refresh = RefreshToken(refresh_token)
            user = get_user_model().objects.get(id=user_id)
            
            if str(refresh['user_id']) != str(user_id):
                return Response({'TOKEN_DOES_NOT_BELONG_TO_USER'}, status=400)

            return build_auth_response(
                user,
                access_token=str(refresh.access_token),
                refresh_token=str(refresh),
            )

        except TokenError as e:
            return Response({'error': str(e)}, status=400)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
