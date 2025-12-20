# file/views.py
# Тут реализуем загрузку файлов (изображений) для объектов недвижимости
from file.file_serializers import FileUploadSerializer
from realtor.settings import MAX_FILES, BASE_URL
from .models import FileUpload
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

baseurl = BASE_URL # Базовый URL для формирования полных ссылок на файлы 

class FileUploadView(APIView):
    # authentication_classes = [JWTAuthentication]  
    # permission_classes = [permissions.IsAuthenticated]

    # Тестовая среда
    authentication_classes = []  
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        if not request.FILES:
            return Response(
                {"detail": "А где?"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем общее количество файлов из request.FILES
        total_files = sum(len(request.FILES.getlist(key)) for key in request.FILES)
        if total_files > MAX_FILES:
            return Response(
                {"detail": f"В таком количестве себе члены в жопу суй, а в один объект можно пихать только {MAX_FILES} изображений"},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_files = []
        for key in request.FILES:
            files = request.FILES.getlist(key)
            for file_obj in files:
                serializer = FileUploadSerializer(data={"file": file_obj})
                serializer.is_valid(raise_exception=True)
                instance = serializer.save()

                uploaded_files.append({
                    "url": f"{baseurl}{instance.file.url}",
                    "name": instance.file.name
                })

        return Response([f["url"] for f in uploaded_files], 
                        status=status.HTTP_201_CREATED)
    