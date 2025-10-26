# file/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import FileUpload
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile


class FileUploadView(APIView):
    """
    Эндпоинт: POST /file
    Принимает binary или multipart файл, сохраняет во временную директорию.
    Возвращает URL файла.
    """

    def post(self, request):
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response({"detail": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)

        saved_file = FileUpload.objects.create(file=file_obj)
        return Response({"url": saved_file.url}, status=status.HTTP_201_CREATED)
