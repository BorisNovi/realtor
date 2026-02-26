from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from .user_serializers import ProfileSerializer, ChangePasswordSerializer
from users.data_transfering import export_properties_csv


User = get_user_model()

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer    
    authentication_classes = [JWTAuthentication]  

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    authentication_classes = [JWTAuthentication]  

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        user = request.user

        if not user.is_authenticated:
            return Response({"USER_DOES_NOT_AUTHORIZED"}, status=401)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"INVALID_OLD_PASSWORD"}, status=400)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"PASSWORD_CHANGED_SUCCESSFULLY"}, status=200)


class DeleteProfileView(generics.DestroyAPIView):
    authentication_classes = [JWTAuthentication]  

    def get_object(self):
        return self.request.user

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        # Тут можно потом добавить удаление связанных данных
        user.delete()
        return Response({"PROFILE_DELETED_SUCCESSFULLY"}, status=status.HTTP_200_OK)


@api_view(["GET"])
def export_csv_view(request):
    return export_properties_csv(request.user)