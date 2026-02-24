from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from realtor.settings import MAX_FILES, BASE_URL
from file.file_serializers import FileUploadSerializer

baseurl = BASE_URL 

class FileUploadView(APIView):
    authentication_classes = [JWTAuthentication]  

    def post(self, request):
        if not request.FILES:
            return Response(
                {"MISSING_FILES"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Проверяем общее количество файлов из request.FILES
        total_files = sum(len(request.FILES.getlist(key)) for key in request.FILES)
        if total_files > MAX_FILES:
            return Response(
                {"TOO_MANY_FILES"},
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
    