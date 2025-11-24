from datetime import datetime

def apply_catalog_filters(objects, query_params):

    # --- Универсальные парсеры ---
    def get_param(*keys):
        """Возвращает первое найденное значение по списку ключей."""
        for key in keys:
            val = query_params.get(key)
            if val is not None:
                return val
        return None

    def get_list(*keys):
        """Возвращает список значений, поддерживает:
        - propertyType=flat&propertyType=house
        - propertyType=flat,house
        - property.type=flat,house
        """
        for key in keys:
            values = query_params.getlist(key)
            if not values:
                continue
            if len(values) == 1 and "," in values[0]:
                return [v.strip() for v in values[0].split(",")]
            return values
        return []

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

    # --- Основная функция проверки объекта ---
    def filter_obj(obj):
        # Даты
        date_from = parse_date(get_param("dateAdded[from]", "dateAdded.from"))
        date_to   = parse_date(get_param("dateAdded[to]", "dateAdded.to"))

        if date_from and obj.date_added.date() < date_from:
            return False
        if date_to and obj.date_added.date() > date_to:
            return False

        # Статус
        status = get_param("status")
        if status and obj.status != status:
            return False

        # Тип недвижимости, TODO: УБЕДИТЬСЯ, ЧТО ВАЛИДНО 
        property_types = get_list("propertyType", "property.type")
        if property_types and obj.get_property_type_display() not in property_types:
            return False

        # Зонирование
        zoning_types = get_list("zoningType", "zoning.type")
        if zoning_types and obj.zoning_type not in zoning_types:
            return False

        # Площадь
        area_min = parse_float(get_param("area[min]", "area.min"))
        area_max = parse_float(get_param("area[max]", "area.max"))

        if area_min is not None and obj.area < area_min:
            return False
        if area_max is not None and obj.area > area_max:
            return False

        # Цена
        price_min  = parse_float(get_param("price[min]", "price.min"))
        price_max  = parse_float(get_param("price[max]", "price.max"))
        currency   = get_param("price[currency]", "price.currency")

        if currency and obj.price_currency != currency:
            return False
        if price_min is not None and obj.price_value < price_min:
            return False
        if price_max is not None and obj.price_value > price_max:
            return False

        return True

    return list(filter(filter_obj, objects))
