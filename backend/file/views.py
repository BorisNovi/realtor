# file/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import FileUpload

baseurl = "http://localhost:8000"

class FileUploadView(APIView):
    # 🔹 Используем JWT для аутентификации
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Проверяем, что файлы пришли
        if not request.FILES:
            return Response({"detail": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_files = []

        # Берём файлы через getlist, чтобы достать все file0, file1 и т.п.
        for key in request.FILES:
            files = request.FILES.getlist(key)
            for file_obj in files:
                # Если нужно, можно привязать к пользователю
                instance = FileUpload.objects.create(file=file_obj)
                uploaded_files.append({
                    "url": f"{baseurl}{instance.file.url}",
                    "name": instance.file.name
                })

        return Response([f["url"] for f in uploaded_files], 
                        status=status.HTTP_201_CREATED)