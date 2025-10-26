# file/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FileUpload
from rest_framework import generics, permissions

class FileUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Проверяем, что файлы вообще пришли
        if not request.FILES:
            return Response({"detail": "No files provided"}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_files = []

        # 🔥 Берём файлы именно через getlist, чтобы достать все file0, file1 и т.п.
        for key in request.FILES:
            files = request.FILES.getlist(key)
            for file_obj in files:
                instance = FileUpload.objects.create(file=file_obj)
                uploaded_files.append({
                    "url": instance.file.url,
                    "name": instance.file.name
                })

        return Response({"urls": [f["url"] for f in uploaded_files]}, status=status.HTTP_201_CREATED)
