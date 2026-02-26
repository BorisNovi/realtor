import csv
from django.http import StreamingHttpResponse
from catalog.catalog_models import Property
from realtor.mixins import filter_by_user

# Т.к. сохранять файл мы никуда не планируем, надо создать псевдо-буфер, который будет возвращать строку напрямую, а не сохранять её в память.
class Echo:
    """Псевдо-буфер для csv.writer — возвращает строку напрямую."""
    def write(self, value):
        return value


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