# file/serializers.py
from rest_framework import serializers
from .models import FileUpload


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ["id", 
                  "url",
                  "file", 
                  "is_temporary", 
                  "created_at"
            ]
        read_only_fields = ["id", "url", "created_at"]

    # Валидация на вес файла
    def validate_file(self, value):
        max_size = 2 * 1024 * 1024  # 2MB
        if value.size > max_size:
            raise serializers.ValidationError("Файл слишком большой. Максимальный размер - 2 Mб.")
        return value