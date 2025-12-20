# file/utils.py
import os
import shutil
import logging
from realtor.settings import BASE_URL
from django.conf import settings
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile

logger = logging.getLogger(__name__)

baseurl = BASE_URL
MAX_SIZE = 500 * 1024  # 500 KB

# Функция для перемещения файла из временной директории в постоянную
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

# Сжатие изображений
def compress_image(image_field):
    print("=== compress_image START ===")
    print(f"Имя файла: {image_field.name}")
    print(f"Исходный размер: {image_field.size} байт")
    print(f"Content type: {getattr(image_field, 'content_type', 'unknown')}")

    img = Image.open(image_field)
    print(f"Открыто изображение: {img.format}, {img.size}, {img.mode}")

    img = img.convert("RGB")
    print("Конвертировано в RGB")

    buffer = BytesIO()
    quality = 85

    while True:
        buffer.seek(0)
        buffer.truncate()

        img.save(
            buffer,
            format="JPEG",
            quality=quality,
            optimize=True
        )

        size = buffer.tell()
        print(f"Пробуем quality={quality} → размер={size} байт")

        if size <= MAX_SIZE:
            print("Размер ОК, выходим из цикла")
            break

        if quality <= 30:
            print("Достигнут минимальный quality, выходим")
            break

        quality -= 5

    print(f"Финальный quality={quality}")
    print(f"Финальный размер={size} байт")
    print("=== compress_image END ===\n")

    return ContentFile(buffer.getvalue(), name=image_field.name)

