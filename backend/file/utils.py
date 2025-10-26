# file/utils.py
import os
import shutil
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def make_files_permanent(temp_url: str, subdir: str) -> str:
    """
    Перемещает файл из /media/temp/... в /media/property/{subdir}/...
    Возвращает новый URL.
    """
    # Абсолютный путь к исходному файлу
    temp_path = os.path.join(settings.BASE_DIR, temp_url.lstrip("/"))
    # Конечная директория: media/property/<subdir>
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

    # Возвращаем относительный URL для сохранения в БД
    new_url = f"/media/property/{subdir}/{filename}"
    return new_url

