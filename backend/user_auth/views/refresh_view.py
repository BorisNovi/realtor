from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from django.contrib.auth import get_user_model
from rest_framework import status

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        user_id = request.data.get('id')
        auth_header = request.headers.get('Authorization')

        if not user_id:
            return Response({'error': 'Missing userId in request body'}, status=400)
        if not auth_header or not auth_header.startswith('Bearer '):
            return Response({'error': 'Invalid Authorization header'}, status=400)

        refresh_token = auth_header.split(' ')[1]

        try:
            refresh = RefreshToken(refresh_token)
            user = get_user_model().objects.get(id=user_id)
            
            if str(refresh['user_id']) != str(user_id):
                return Response({'error': 'Token does not belong to this user'}, status=400)

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
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response({'error': str(e)}, status=400)
        except get_user_model().DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
