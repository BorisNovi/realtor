import csv, logging
from django.http import StreamingHttpResponse
from catalog.catalog_models import Property
from realtor.mixins import filter_by_user
from users.csv_headers import HEADERS

logger = logging.getLogger(__name__)

# Т.к. сохранять файл мы никуда не планируем, надо создать псевдо-буфер, 
# который будет возвращать строку напрямую, а не сохранять её в память.
class Echo:
    """Псевдо-буфер для csv.writer — возвращает строку напрямую."""
    def write(self, value):
        return value

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
        addr.get("country", ""),
        addr.get("region", ""),
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

