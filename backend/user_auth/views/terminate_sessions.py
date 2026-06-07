from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken

class LogoutAllView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        user = request.user

        # убиваем access
        user.last_logout_at = timezone.now()
        user.save(update_fields=["last_logout_at"])

        # убиваем refresh
        tokens = OutstandingToken.objects.filter(
            user=user,
            expires_at__gt=timezone.now()
        )

        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

        response = Response(status=status.HTTP_205_RESET_CONTENT)
        response.delete_cookie('refresh_token', path='/api/v1/auth/refresh')
        return response



