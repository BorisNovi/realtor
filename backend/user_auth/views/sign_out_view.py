from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


class SignOutView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        response = Response(status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('refresh_token', path='/api/v1/auth/refresh')
        return response
