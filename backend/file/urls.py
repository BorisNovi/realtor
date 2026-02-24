from django.urls import path
from .file_views import FileUploadView

urlpatterns = [
    path("", FileUploadView.as_view(), name="file-upload"),
]

