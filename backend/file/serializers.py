# file/serializers.py
from rest_framework import serializers
from .models import FileUpload


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ["id", 
                  "url", 
                  "is_temporary", 
                  "created_at"]
