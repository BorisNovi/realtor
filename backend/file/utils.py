# file/utils.py
import os
import shutil
from django.conf import settings
import logging

baseurl = "http://localhost:8000"

logger = logging.getLogger(__name__)

def make_files_permanent(temp_url: str, subdir: str) -> str:
    """
    Перемещает файл из /media/temp/... в /media/property/{subdir}/...
    Возвращает новый URL.
    """
    # Оставляем путь относительно MEDIA_ROOT
    if temp_url.startswith("http://") or temp_url.startswith("https://"):
        temp_url = temp_url.split("/media/")[-1]  # берем путь после /media/

    temp_path = os.path.join(settings.MEDIA_ROOT, temp_url)
    permanent_dir = os.path.join(settings.MEDIA_ROOT, 'property', subdir)
    os.makedirs(permanent_dir, exist_ok=True)

    filename = os.path.basename(temp_path)
    new_path = os.path.join(permanent_dir, filename)

    logger.debug(f"[move] from={temp_path} to={new_path}")

    if os.path.exists(temp_path):
        shutil.move(temp_path, new_path)
        logger.info(f"✅ Файл перемещён: {temp_path} → {new_path}")
    else:
        logger.warning(f"⚠️ Файл не найден: {temp_path}")

    # Возвращаем URL для БД
    new_url = f"{baseurl}/media/property/{subdir}/{filename}"
    return new_url


