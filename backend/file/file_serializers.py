# file/serializers.py
from rest_framework import serializers
from .models import FileUpload
from file.file_utils import compress_image

# Сериализатор для загрузки файлов
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

    # Валидация на вес файла
    def validate_file(self, value):
        max_size = 2 * 1024 * 1024  # 2MB
        if value.size > max_size:
            raise serializers.ValidationError("Файл слишком большой. Максимальный размер - 2 Mб.")
        return value

    def create(self, validated_data):
        print(f"Получили файл для сохранения: {validated_data.get('file').name}, размер: {validated_data.get('file').size} байт")
        file = validated_data.get("file")

        # Сжимаем ТОЛЬКО изображения
        if file and file.content_type.startswith("image/"):
            validated_data["file"] = compress_image(file)

        return super().create(validated_data)