# file/tasks.py
import os
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import FileUpload


def clean_expired_temp_files():
    expired_files = FileUpload.objects.filter(
        is_temporary=True,
        created_at__lt=timezone.now() - timedelta(hours=1)
    )

    for f in expired_files:
        if f.file and os.path.exists(f.file.path):
            os.remove(f.file.path)
        f.delete()
