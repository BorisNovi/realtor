from datetime import datetime

def apply_catalog_filters(qs, query_params):
    """Применяет фильтры из query_params к списку объектов."""

    # --- Универсальные парсеры ---
    def get_param(*keys):
        """Возвращает первое найденное значение по списку ключей."""
        for key in keys:
            val = query_params.get(key)
            if val is not None:
                return val
        return None

    def get_list(*keys):
        values = []
        for key in keys:
            # ищем exact
            values.extend(query_params.getlist(key))
            # ищем ключи вида key[0], key[1] ...
            i = 0
            while True:
                indexed_key = f"{key}[{i}]"
                val = query_params.get(indexed_key)
                if val is None:
                    break
                values.append(val)
                i += 1
        # Если есть строки вида "flat,house" — разделим
        result = []
        for v in values:
            if "," in v:
                result.extend([x.strip() for x in v.split(",")])
            else:
                result.append(v)
        return result

    def parse_date(val):
        """ISO, YYYY-MM-DD — похуй, съест всё."""
        if not val:
            return None
        try:
            # ISO формат типа 2025-11-03T20:00:00.000Z
            return datetime.fromisoformat(val.replace("Z", "+00:00")).date()
        except Exception:
            pass
        try:
            return datetime.strptime(val, "%Y-%m-%d").date()
        except Exception:
            return None

    def parse_float(val):
        try:
            return float(val)
        except:
            return None

    # ===================== ФИЛЬТРЫ ========================

    # Дата добавления
    date_from = parse_date(get_param("dateAdded[from]", "dateAdded.from"))
    date_to   = parse_date(get_param("dateAdded[to]", "dateAdded.to"))
    if date_from:
        qs = qs.filter(date_added__gte=date_from)
    if date_to:
        qs = qs.filter(date_added__lte=date_to)

    # Статус
    status = get_param("status")
    if status:
        qs = qs.filter(status=status)

    # Контакт
    contact = get_param("contact")
    if contact:
        qs = qs.filter(contact=contact)

    # Тип недвижимости
    property_types = get_list("propertyType", "property.type")
    if property_types:
        qs = qs.filter(polymorphic_ctype__model__in=property_types)

    # Тип собственности
    zoning_types = get_list("zoningType", "zoning.type")
    if zoning_types:
        qs = qs.filter(zoning_type__in=zoning_types)
    
    # Площадь
    area_min = parse_float(get_param("area[min]", "area.min"))
    area_max = parse_float(get_param("area[max]", "area.max"))
    if area_min is not None:
        qs = qs.filter(area__gte=area_min)
    if area_max is not None:
        qs = qs.filter(area__lte=area_max)

    # Цена
    price_min  = parse_float(get_param("price[min]", "price.min"))
    price_max  = parse_float(get_param("price[max]", "price.max"))
    currency   = get_param("price[currency]", "price.currency")

    if currency:
        qs = qs.filter(price_currency=currency)
    if price_min is not None:
        qs = qs.filter(price_value__gte=price_min)
    if price_max is not None:
        qs = qs.filter(price_value__lte=price_max)

    # Наличие фото
    has_photos = get_param("hasPhotos", "has.photos")
    if has_photos in ("true", "1"):
        qs = qs.exclude(photos=[])      # photos != '[]'
    elif has_photos in ("false", "0"):
        qs = qs.filter(photos=[])       # photos = '[]'

    return qs
