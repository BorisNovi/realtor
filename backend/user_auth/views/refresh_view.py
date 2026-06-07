from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model
from user_auth.views.auth_view import build_auth_response

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({'error': 'MISSING_REFRESH_TOKEN'}, status=400)

        try:
            refresh = RefreshToken(refresh_token)
            user_id = refresh['user_id']
            user = get_user_model().objects.get(id=user_id)

            return build_auth_response(
                user,
                access_token=str(refresh.access_token),
                refresh_token=str(refresh),
            )

        except TokenError as e:
            return Response({'error': str(e)}, status=400)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
