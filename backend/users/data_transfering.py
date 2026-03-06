from collections import defaultdict
import csv
import io
from django.http import StreamingHttpResponse
from django.db import transaction
from catalog.catalog_models import Property
from catalog.views.create_update_object_view import PROPERTY_WRITE_SERIALIZER_MAP
from contacts.contact_serializers import ContactSerializer
from contacts.models import Contact
from realtor.mixins import filter_by_user
import traceback
import logging

logger = logging.getLogger(__name__)

# Т.к. сохранять файл мы никуда не планируем, надо создать псевдо-буфер, который будет возвращать строку напрямую, а не сохранять её в память.
class Echo:
    """Псевдо-буфер для csv.writer — возвращает строку напрямую."""
    def write(self, value):
        return value

# Словарик для наглядности. 
# Ключи — это имена полей модели, а значения — заголовки столбцов в CSV.
HEADERS = {
    "id": "ID",
    "property_type": "Property Type",
    "name": "Name",
    "status": "Status",
    "zoning_type": "Zoning Type",
    "price_value": "Price",
    "price_currency": "Currency",
    "area": "Area",
    "address_city": "City",
    "address_road": "Street",
    "address_house": "House",
    "address_apartment": "Apartment",
    "address_lng": "Longitude",
    "address_lat": "Latitude",
    "contact_name": "Contact Name",
    "contact_phone": "Contact Phone",
    "contact_additional_phone": "Contact Additional Phone",
    "contact_comment": "Contact Comment",
    "comment": "Comment",
    "date_added": "Date Added",
}


def property_to_row(prop: Property) -> list:
    # Раскладываем адрес по полям. Если данных нет, ставим пустые строки.
    addr = prop.address or {}
    position = addr.get("position") or []
    lng = position[0] if len(position) > 0 else ""
    lat = position[1] if len(position) > 1 else ""

    # Раскладываем контакт по полям. Если контакта нет, ставим пустые строки.
    c = prop.contact
    
    # Порядок полей должен соответствовать порядку заголовков в HEADERS.
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


def _build_queryset(user):
    qs = Property.objects.filter(is_deleted=False).select_related("contact")
    return filter_by_user(qs, user)

# Заметка: ВОМ - это специальный символ, который сообщает Excel, что файл в кодировке UTF-8. 
# Без него Excel может неправильно отобразить кириллицу.
def _prepend_bom(generator):
    """Подставляет BOM в начало CSV для корректного отображения в Excel."""
    yield "\ufeff"
    yield from generator


def export_properties_csv(user) -> StreamingHttpResponse:
    """Генерирует CSV-файл со всеми объектами недвижимости пользователя."""
    queryset = _build_queryset(user)

    pseudo_buffer = Echo()
    writer = csv.writer(pseudo_buffer)

    def generate_rows():
        yield writer.writerow(HEADERS.values())
        for prop in queryset.iterator(chunk_size=500):
            yield writer.writerow(property_to_row(prop))

    response = StreamingHttpResponse(
        _prepend_bom(generate_rows()),
        content_type="text/csv; charset=utf-8",
    )
    response["Content-Disposition"] = 'attachment; filename="properties.csv"'
    return response


from rest_framework.test import APIRequestFactory




from django.contrib.contenttypes.models import ContentType
def _build_property(row, user, contacts_cache: dict):
    property_type = row["Property Type"]
    serializer_class = PROPERTY_WRITE_SERIALIZER_MAP.get(property_type)

    if not serializer_class:
        raise ValueError(f"Unknown property type: {property_type}")

    model = serializer_class.Meta.model
    polymorphic_ctype = ContentType.objects.get_for_model(model)
    contact = None

    if row["Contact Phone"]:
        phone = row["Contact Phone"]

        if phone in contacts_cache:
            contact = contacts_cache[phone]
        else:
            # Сначала ищем существующий контакт в БД
            existing = Contact.objects.filter(phone=phone, user=user).first()
            if existing:
                contact = existing
            else:
                contact_data = {
                    "name": row["Contact Name"],
                    "phone": phone,
                    "additional_phone": row["Contact Additional Phone"],
                    "comment": row["Contact Comment"],
                }

                factory = APIRequestFactory()
                fake_request = factory.post("/")
                fake_request.user = user

                serializer = ContactSerializer(
                    data=contact_data,
                    context={"request": fake_request}
                )
                serializer.is_valid(raise_exception=True)
                contact = Contact(**serializer.validated_data)

            contacts_cache[phone] = contact

    address = {
        "city": row["City"],
        "road": row["Street"],
        "house": row["House"],
        "apartment": row["Apartment"],
        "position": [
            float(row["Longitude"]) if row["Longitude"] else None,
            float(row["Latitude"]) if row["Latitude"] else None,
        ],
    }

    obj = model(

        # polymorphic
        polymorphic_ctype=polymorphic_ctype,

        # базовые поля
        # property_type=property_type,
        name=row["Name"],
        status=row["Status"],
        zoning_type=row["Zoning Type"],
        price_value=row["Price"],
        price_currency=row["Currency"],
        area=row["Area"],
        address=address,
        comment=row["Comment"],

        # связи
        user=user,
        contact=contact,
    )

    return obj, contact

# Главная функция для импорта. 
# Читает CSV, строит объекты и сохраняет их в БД. 
# Если возникают ошибки, откатывает транзакцию и возвращает список ошибок.
def import_properties_csv(file, user):
    """Импортирует объекты недвижимости из CSV-файла. 
    Возвращает количество созданных объектов и список ошибок."""

    wrapper = io.TextIOWrapper(file.file, encoding="utf-8")
    reader = csv.DictReader(wrapper)

    if reader.fieldnames and reader.fieldnames[0].startswith("\ufeff"):
        reader.fieldnames[0] = reader.fieldnames[0].replace("\ufeff", "")

    expected_headers = list(HEADERS.values())
    if reader.fieldnames != expected_headers:
        raise ValueError("HEADERS_MISMATCH")

    objects_by_model = defaultdict(list)

    created = 0
    errors = []

    contacts_cache = {}

    max_rows = 5 # Ограничение на количество строк в импортируемой таблице. 

    with transaction.atomic():
        for line_number, row in enumerate(reader, start=2):
            if max_rows is not None and (line_number - 1) > max_rows:
                errors.append({
                    "TOO_MANY_ROWS"
                })
                transaction.set_rollback(True)
                return 0, errors
            
            try:
                obj, contact = _build_property(row, user, contacts_cache)
                objects_by_model[type(obj)].append(obj)
                # contacts берём из кэша

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

        # создаём объекты недвижимости через save (multi-table наследование)
        for model, objects in objects_by_model.items():
            for obj in objects:
                obj.save()
                created += 1

    return created, []

