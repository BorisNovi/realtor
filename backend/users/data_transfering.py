import csv, io, logging
from collections import defaultdict
from django.contrib.contenttypes.models import ContentType
from django.http import StreamingHttpResponse
from django.db import transaction
from django.utils import timezone
from catalog.catalog_models import Property, PropertyStatus
from catalog.views.create_update_object_view import PROPERTY_WRITE_SERIALIZER_MAP
from contacts.contact_serializers import ContactSerializer
from contacts.models import Contact
from realtor.mixins import filter_by_user
from realtor.settings import MAX_ROWS


logger = logging.getLogger(__name__)

# Т.к. сохранять файл мы никуда не планируем, надо создать псевдо-буфер, 
# который будет возвращать строку напрямую, а не сохранять её в память.
class Echo:
    """Псевдо-буфер для csv.writer — возвращает строку напрямую."""
    def write(self, value):
        return value

# Словарик заголовков. 
HEADERS = {
    "id": {"csv": "ID", "required": False},
    "property_type": {"csv": "Property Type", "required": True},
    "name": {"csv": "Name", "required": False},
    "status": {"csv": "Status", "required": False, "default": "available"},
    "zoning_type": {"csv": "Zoning Type", "required": False, "default": "residential"},
    "price_value": {"csv": "Price", "required": True},
    "price_currency": {"csv": "Currency", "required": True},
    "area": {"csv": "Area", "required": False, "default": 0},
    "address_city": {"csv": "City", "required": True}, # ДОБАВЬ СТРАНУ И РЕГИОН!!!!!!!!!!!!!!!
    "address_road": {"csv": "Street", "required": True},
    "address_house": {"csv": "House", "required": True},
    "address_apartment": {"csv": "Apartment", "required": False},
    "address_lng": {"csv": "Longitude", "required": False},
    "address_lat": {"csv": "Latitude", "required": False},
    "contact_name": {"csv": "Contact Name", "required": False},
    "contact_phone": {"csv": "Contact Phone", "required": False},
    "contact_additional_phone": {"csv": "Contact Additional Phone", "required": False},
    "contact_comment": {"csv": "Contact Comment", "required": False},
    "comment": {"csv": "Comment", "required": False},
    "date_added": {"csv": "Date Added", "required": False},
}

CSV_TO_FIELD = {v["csv"]: k for k, v in HEADERS.items()}
REQUIRED_HEADERS = {v["csv"] for v in HEADERS.values() if v.get("required")}


# ========================= ЭКСПОРТ ==========================

# Список CSV заголовков (в правильном порядке)
CSV_HEADERS = [v["csv"] for v in HEADERS.values()]

# Раскладываем данные из БД по полям. 
# Если данных нет, ставим пустые строки.
def property_to_row(prop: Property) -> list:
    addr = prop.address or {}
    position = addr.get("position") or []

    lng = position[0] if len(position) > 0 else ""
    lat = position[1] if len(position) > 1 else ""

    c = prop.contact

    return [
        prop.id,
        prop.property_type,
        prop.name or "",
        prop.status,
        prop.zoning_type,
        prop.price_value,
        prop.price_currency,
        prop.area,
        addr.get("city", ""),
        addr.get("road", ""),
        addr.get("house", ""),
        addr.get("apartment", ""),
        lng,
        lat,
        c.name if c else "",
        c.phone if c else "",
        c.additional_phone if c else "",
        c.comment if c else "",
        prop.comment or "",
        prop.date_added.strftime("%Y-%m-%d %H:%M:%S") if prop.date_added else "",
    ]


# Строим queryset с нужными связями.
def _build_queryset(user):
    qs = Property.objects.filter(is_deleted=False).select_related("contact")
    return filter_by_user(qs, user)


# BOM для Excel
def _prepend_bom(generator):
    yield "\ufeff"
    yield from generator


# Главная функция экспорта
def export_properties_csv(user) -> StreamingHttpResponse:
    """Генерирует CSV-файл со всеми объектами недвижимости пользователя."""

    queryset = _build_queryset(user)

    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)

    def generate_rows():
        try:
            yield writer.writerow(CSV_HEADERS)

            for prop in queryset.iterator(chunk_size=500):
                yield writer.writerow(property_to_row(prop))

        except Exception as e:
            logger.exception("CSV export failed mid-stream")
            yield writer.writerow([f"EXPORT_ERROR: {type(e).__name__}"])

    response = StreamingHttpResponse(
        _prepend_bom(generate_rows()),
        content_type="text/csv; charset=utf-8",
    )

    response["Content-Disposition"] = 'attachment; filename="properties.csv"'

    return response



# ========================== ИМПОРТ ==========================

def _validate_status(value, model):
    allowed = {c[0] for c in PropertyStatus.choices}
    default = HEADERS["status"].get("default")

    if value not in allowed:
        logger.warning("Invalid status '%s', fallback to '%s'", value, default)
        return default

    return value


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
        "city": get_row_value(row, "address_city"),
        "road": get_row_value(row, "address_road"),
        "house": get_row_value(row, "address_house"),
        "apartment": get_row_value(row, "address_apartment"),
        "position": position,
    }

    obj = model(
        polymorphic_ctype=polymorphic_ctype,
        name=get_row_value(row, "name"),
        status = _validate_status(get_row_value(row, "status"), model),
        zoning_type=get_row_value(row, "zoning_type"),
        price_value=price,
        price_currency=get_row_value(row, "price_currency"),
        area=area,
        address=address,
        comment=get_row_value(row, "comment"),
        user=user,
        contact=contact,
        date_added=get_row_value(row, "date_added") or timezone.now(),
    )

    return obj, contact


def import_properties_csv(file, user):
    """Импорт объектов недвижимости из CSV."""

    wrapper = io.TextIOWrapper(file.file, encoding="utf-8")
    reader = csv.DictReader(wrapper)

    if reader.fieldnames and reader.fieldnames[0].startswith("\ufeff"):
        reader.fieldnames[0] = reader.fieldnames[0].replace("\ufeff", "")

    missing_required = REQUIRED_HEADERS - set(reader.fieldnames or [])

    if missing_required:
        raise ValueError(f"Missing required columns: {', '.join(missing_required)}")

    objects_by_model = defaultdict(list)
    contacts_cache = {}

    created = 0
    errors = []

    with transaction.atomic():

        for line_number, row in enumerate(reader, start=2):

            if MAX_ROWS is not None and (line_number - 1) > MAX_ROWS:
                errors.append({
                    "line": line_number,
                    "error_type": "TOO_MANY_ROWS",
                    "error": f"File exceeds maximum allowed rows ({MAX_ROWS})",
                    "row": None
                })
                transaction.set_rollback(True)
                return 0, errors

            try:
                obj, contact = _build_property(row, user, contacts_cache)
                objects_by_model[type(obj)].append(obj)

            except Exception as e:

                logger.exception(
                    "CSV import error on line %s | row=%s",
                    line_number,
                    row
                )

                errors.append({
                    "line": line_number,
                    "error_type": type(e).__name__,
                    "error": str(e),
                    "row": row
                })

        if errors:
            transaction.set_rollback(True)
            return 0, errors

        new_contacts = [c for c in contacts_cache.values() if c.pk is None]

        Contact.objects.bulk_create(new_contacts, batch_size=500)

        for model, objects in objects_by_model.items():

            for obj in objects:

                if obj.contact and obj.contact.pk:
                    obj.contact_id = obj.contact.pk

                obj.save()
                created += 1

    return created, []


