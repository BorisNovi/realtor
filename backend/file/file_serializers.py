from rest_framework import serializers
from .models import FileUpload
from file.file_utils import compress_image

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = [
            "id", 
            "url",
            "file",
            "is_temporary",
            "created_at"
        ]
        read_only_fields = ["id", "url", "created_at"]

    def validate_file(self, value):
        max_size = 2 * 1024 * 1024  # 2 MB
        if value.size > max_size:
            raise serializers.ValidationError("TOO_HEAVY_FILE")
        return value

    def create(self, validated_data):
        print(f"Получили файл для сохранения: {validated_data.get('file').name}, размер: {validated_data.get('file').size} байт")
        file = validated_data.get("file")

        if file and file.content_type.startswith("image/"):
            validated_data["file"] = compress_image(file)

        return super().create(validated_data)