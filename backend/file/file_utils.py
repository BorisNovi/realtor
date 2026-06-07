import os, shutil, logging
from django.conf import settings
from PIL import Image
from io import BytesIO
from django.core.files.base import ContentFile
from realtor.settings import BASE_URL

logger = logging.getLogger(__name__)

baseurl = BASE_URL
MAX_SIZE = 500 * 1024  # 500 KB

# Функция для перемещения файла из временной директории в постоянную
def make_files_permanent(temp_url: str) -> str:
    """
    Перемещает файл из /media/temp/... в /media/permanent/...
    Возвращает новый URL.
    """
    # Оставляем путь относительно MEDIA_ROOT
    if temp_url.startswith("http://") or temp_url.startswith("https://"):
        temp_url = temp_url.split(settings.MEDIA_URL)[-1]

    temp_path = os.path.join(settings.MEDIA_ROOT, temp_url)
    permanent_dir = os.path.join(settings.MEDIA_ROOT, "permanent")
    os.makedirs(permanent_dir, exist_ok=True)

    filename = os.path.basename(temp_path)

    # Чтобы не перетирать файлы с одинаковыми именами
    name, ext = os.path.splitext(filename)
    counter = 1
    new_filename = filename
    new_path = os.path.join(permanent_dir, new_filename)

    while os.path.exists(new_path):
        new_filename = f"{name}_{counter}{ext}"
        new_path = os.path.join(permanent_dir, new_filename)
        counter += 1

    logger.debug(f"[move] from={temp_path} to={new_path}")

    if os.path.exists(temp_path):
        shutil.move(temp_path, new_path)
        logger.info(f"✅ Файл перемещён: {temp_path} → {new_path}")
    else:
        logger.warning(f"⚠️ Файл не найден: {temp_path}")

    new_url = f"{baseurl}{settings.MEDIA_URL}permanent/{new_filename}"
    return new_url


def compress_image(image_field):
    # Читаем весь файл в память до того, как отдаём PIL.
    # PIL ленив: Image.open() читает только заголовок, а пиксельные данные
    # подгружает позже, держа ссылку на исходный файловый объект.
    # Через Nginx/Gunicorn позиция указателя или буферизация могут дать PIL
    # неполные данные → сохраняется обрезанный JPEG. BytesIO это исключает.
    image_field.seek(0)
    data = image_field.read()
    print(f"[compress] {image_field.name} uploaded={len(data)} bytes", flush=True)

    img = Image.open(BytesIO(data))
    img.load()
    img = img.convert("RGB")

    buffer = BytesIO()
    quality = 85

    while True:
        buffer.seek(0)
        buffer.truncate()

        img.save(buffer, format="JPEG", quality=quality, optimize=True)

        if buffer.tell() <= MAX_SIZE or quality <= 30:
            break

        quality -= 5

    compressed_size = buffer.tell()
    print(f"[compress] {image_field.name} compressed={compressed_size} bytes quality={quality}", flush=True)

    original_name = os.path.splitext(os.path.basename(image_field.name))[0]
    return ContentFile(buffer.getvalue(), name=f"{original_name}.jpg")

