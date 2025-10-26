# file/models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta

def temp_upload_path(instance, filename):
    return f"temp/{filename}"  # <-- файлы будут в media/temp/

class FileUpload(models.Model):
    file = models.FileField(upload_to=temp_upload_path)
    url = models.URLField(blank=True)
    is_temporary = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # сначала сохраняем файл
        if not self.url:
            self.url = self.file.url  # теперь file.url точно вернёт /media/temp/filename
            super().save(update_fields=["url"])


    def is_expired(self) -> bool:
        if not self.is_temporary:
            return False
        return timezone.now() - self.created_at > timedelta(hours=1)
