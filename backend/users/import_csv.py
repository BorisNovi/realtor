import csv, io, logging, re
from collections import defaultdict
from rest_framework.exceptions import ValidationError
from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.utils import timezone
from realtor.settings import MAX_ROWS
from catalog.catalog_models import PropertyStatus
from catalog.views.create_update_object_view import PROPERTY_WRITE_SERIALIZER_MAP
from contacts.contact_serializers import ContactSerializer
from contacts.models import Contact
from users.csv_headers import HEADERS, REQUIRED_HEADERS

logger = logging.getLogger(__name__)
ISO_ALPHA2_RE = re.compile(r'^[A-Z]{2}$')

# Базовые поля, которые есть у всех Property
BASE_FIELDS = {
    "name", "status", "zoning_type", "price_value", "price_currency",
    "area", "comment", "date_added",
}

# Все специфичные поля дочерних моделей
SPECIFIC_FIELDS = {
    "rooms", "floor_current", "floor_full", "kitchen_type", "heating",
    "furnished", "renovation", "shared_kitchen", "shared_bathroom",
    "electricity", "water_supply", "natural_gas", "sewerage", "internet",
    "bath", "shower", "air_conditioning", "fireplace", "beautiful_view",
    "new_building", "elevator", "parking", "balcony", "garden", "garage",
}

# Да, такой список у нас уже есть для экспорта, но ничего не поделать. 
# Ключевое различие списков - разделить поля на базовые (есть у всех) и специфичные (только у дочерних), 
# и передавать специфичные через **kwargs. 

# Проверяем статус
def _validate_status(value, model):
    """Проверяет статус объекта. Если выходит за пределы допустимых значений, возвращает "available"."""
    allowed = {c[0] for c in PropertyStatus.choices}
    default = HEADERS["status"].get("default")

    if value not in allowed:
        logger.warning("Invalid status '%s', fallback to '%s'", value, default)
        return default

    return value

# Проверяем адрес на наличие всех обязательных полей.
def _validate_address(row):
    # Валидация страны по ISO Alpha-2
    country = get_row_value(row, "address_country")
    if country:
        if not ISO_ALPHA2_RE.match(str(country).strip().upper()):
            raise ValidationError(
                f"Invalid country code '{country}'. "
                f"Use ISO Alpha-2 format (e.g. 'US', 'GE', 'DE')."
            )
            
    missing = [
        HEADERS[field]["csv"]
        for field in HEADERS
        if field.startswith("address_") and HEADERS[field].get("required") and not get_row_value(row, field)
    ]
    if missing:
        raise ValueError(f"Missing required address fields: {', '.join(missing)}")


def get_row_value(row, field):
    """Получить значение поля из CSV с учётом дефолтов."""
    meta = HEADERS[field]
    column = meta["csv"]

    if column not in row or row[column] in ("", None):
        return meta.get("default")

    return row[column]


def _parse_float(value, field):
    """Безопасный парсинг float."""
    if value in (None, ""):
        return None
    try:
        return float(value)
    except ValueError:
        raise ValueError(f"Invalid {field} value")


def _build_property(row, user, contacts_cache: dict):

    property_type = get_row_value(row, "property_type")

    serializer_class = PROPERTY_WRITE_SERIALIZER_MAP.get(property_type)
    if not serializer_class:
        raise ValueError(f"Unknown property type: {property_type}")
    
    _validate_address(row)

    model = serializer_class.Meta.model
    polymorphic_ctype = ContentType.objects.get_for_model(model)

    price = _parse_float(get_row_value(row, "price_value"), "Price")
    area = _parse_float(get_row_value(row, "area"), "Area")
    lng = _parse_float(get_row_value(row, "address_lng"), "Longitude")
    lat = _parse_float(get_row_value(row, "address_lat"), "Latitude")

    contact = None
    phone = get_row_value(row, "contact_phone")

    if phone:
        if phone in contacts_cache:
            contact = contacts_cache[phone]
        else:
            existing = Contact.objects.filter(phone=phone, user=user).first()

            if existing:
                contact = existing
            else:
                contact_data = {
                    "name": get_row_value(row, "contact_name"),
                    "phone": phone,
                    "additional_phone": get_row_value(row, "contact_additional_phone"),
                    "comment": get_row_value(row, "contact_comment"),
                }

                serializer = ContactSerializer(
                    data=contact_data,
                    context={"user": user}
                )

                serializer.is_valid(raise_exception=True)
                contact = Contact(**serializer.validated_data)

            contacts_cache[phone] = contact

    position = [lng, lat] if lng is not None and lat is not None else []

    address = {
        "country": str(get_row_value(row, "address_country")).strip().upper(),
        "region": get_row_value(row, "address_region"),
        "city": get_row_value(row, "address_city"),
        "road": get_row_value(row, "address_road"),
        "house": get_row_value(row, "address_house"),
        "apartment": get_row_value(row, "address_apartment"),
        "position": position,
    }

    # Собираем специфичные поля — только те, что реально есть у этой модели
    specific_kwargs = {}
    model_fields = {f.name for f in model._meta.get_fields()}

    for field in SPECIFIC_FIELDS:
        if field not in model_fields:
            continue  # этой модели поле не принадлежит — пропускаем

        value = get_row_value(row, field)

        if value in (None, ""):
            continue  # не передаём пустые — пусть сработает default модели

        # Булевые поля из CSV приходят строкой — конвертируем
        model_field = model._meta.get_field(field)
        if model_field.get_internal_type() == "BooleanField":
            specific_kwargs[field] = str(value).strip().lower() in ("true", "1", "yes")
        elif model_field.get_internal_type() in ("IntegerField", "PositiveIntegerField"):
            specific_kwargs[field] = int(value)
        else:
            specific_kwargs[field] = value

    obj = model(
        polymorphic_ctype=polymorphic_ctype,
        name=get_row_value(row, "name"),
        status=_validate_status(get_row_value(row, "status"), model),
        zoning_type=get_row_value(row, "zoning_type"),
        price_value=price,
        price_currency=get_row_value(row, "price_currency"),
        area=area,
        address=address,
        comment=get_row_value(row, "comment"),
        user=user,
        contact=contact,
        date_added=get_row_value(row, "date_added") or timezone.now(),
        **specific_kwargs, 
    )

    return obj, contact

# Главная функция импорта.
def import_properties_csv(file, user):
    """Импортирует объекты недвижимости из CSV.
    Валидные строки сохраняются, невалидные — пропускаются."""

    wrapper = io.TextIOWrapper(file.file, encoding="utf-8")
    reader = csv.DictReader(wrapper, delimiter=';')


    if reader.fieldnames and reader.fieldnames[0].startswith("\ufeff"):
        reader.fieldnames[0] = reader.fieldnames[0].replace("\ufeff", "")

    missing_required = REQUIRED_HEADERS - set(reader.fieldnames or [])
    if missing_required:
        raise ValueError(f"Missing required columns: {', '.join(missing_required)}")

    valid_objects = []        
    contacts_cache = {}       
    errors = []

    for line_number, row in enumerate(reader, start=2):

        if MAX_ROWS is not None and (line_number - 1) > MAX_ROWS:
            errors.append({
                "line": line_number,
                "error_type": "TOO_MANY_ROWS",
                "error": f"File exceeds maximum allowed rows ({MAX_ROWS})",
                "row": None,
            })
            break

        try:
            obj, contact = _build_property(row, user, contacts_cache)
            valid_objects.append(obj)
        except Exception as e:
            logger.exception("CSV import error on line %s | row=%s", line_number, row)
            errors.append({
                "line": line_number,
                "error_type": type(e).__name__,
                "error": str(e),
                "row": row,
            })

    # Сохраняем всё валидное одной транзакцией
    created = 0

    if valid_objects:
        with transaction.atomic():
            # Контакты без pk — те, что нужно создать
            new_contacts = [c for c in contacts_cache.values() if c.pk is None]
            Contact.objects.bulk_create(new_contacts, batch_size=500)

            for obj in valid_objects:
                if obj.contact and obj.contact.pk:
                    obj.contact_id = obj.contact.pk
                obj.save()
                created += 1

    return {
        "created": created,
        "errors": errors,
    }



