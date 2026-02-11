from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .user_serializers import ProfileSerializer, ChangePasswordSerializer
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()

# Просмотр и редактирование профиля
class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    
    authentication_classes = [JWTAuthentication]  
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

# Смена пароля
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    authentication_classes = [JWTAuthentication]  
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        user = request.user

        if not user.is_authenticated:
            return Response({"detail": "Пользователь не авторизован"}, status=401)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": "Неверный пароль"}, status=400)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"detail": "Пароль успешно изменён"})

# Удаление профиля
class DeleteProfileView(generics.DestroyAPIView):
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]

    # Тестовая среда
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # Тут можно потом добавить удаление связанных данных
        user.delete()
        return Response({"detail": "Профиль удален"}, status=status.HTTP_200_OK)
