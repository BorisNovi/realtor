# file/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication

from file.serializers import FileUploadSerializer
from .models import FileUpload

baseurl = "http://localhost:8000" # TODO: В будущем заменить на продакшен URL
MAX_FILES = 25                    # Допустимое Количество изображений на 1 объект недвижимости 

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
                status=status.HTTP_400_BAD_REQUEST # Тут валидируется наличие файлов, если обращаемся именно к этому эндпоинту. 
            )

        total_files = sum(len(request.FILES.getlist(key)) for key in request.FILES)
        if total_files > MAX_FILES:
            return Response(
                {"detail": f"В таком количестве себе члены в жопу суй, а в один объект можно пихать только {MAX_FILES} изображений"},
                status=status.HTTP_400_BAD_REQUEST
            )

        uploaded_urls = []

        for key in request.FILES:
            for file_obj in request.FILES.getlist(key):
                serializer = FileUploadSerializer(data={"file": file_obj})
                serializer.is_valid(raise_exception=True)
                instance = serializer.save()

                uploaded_urls.append(instance.url)

        return Response(uploaded_urls, status=status.HTTP_201_CREATED)


