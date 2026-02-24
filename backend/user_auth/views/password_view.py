import secrets
from datetime import timedelta
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from users.models import User, PasswordResetRequest

class PasswordRecoveryView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"EMAIL_IS_REQUIRED"}, status=status.HTTP_400_BAD_REQUEST)

        validator = EmailValidator()
        try:
            validator(email)
        except ValidationError:
            return Response({"INVALID_EMAIL_FORMAT"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"USER_NOT_FOUND"}, status=status.HTTP_404_NOT_FOUND)

        token = secrets.token_urlsafe(32)
        PasswordResetRequest.objects.create(user=user, token=token)

        reset_url = request.build_absolute_uri(f"/auth/password-reset-activate/?token={token}")

        send_mail(
            "Password Reset Request",
            f"To reset your password, click the following link: {reset_url}",
            "no-reply@example.com",
            [email],
            fail_silently=False,
        )

        return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)


class PasswordResetActivateView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        new_password = request.data.get("password")

        if not token or not new_password:
            return Response({"TOKEN_AND_PASSWORD_REQUIRED"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            reset_request = PasswordResetRequest.objects.get(token=token)
        except PasswordResetRequest.DoesNotExist:
            return Response({"INVALID_OR_EXPIRED_TOKEN"}, status=status.HTTP_400_BAD_REQUEST)

        if reset_request.created_at < timezone.now() - timedelta(hours=1):
            return Response({"TOKEN_EXPIRED"}, status=status.HTTP_400_BAD_REQUEST)

        user = reset_request.user
        user.set_password(new_password)
        user.save()

        reset_request.delete()

        return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)
