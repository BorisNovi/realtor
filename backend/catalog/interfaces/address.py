def get_address(obj):
    address = obj.address or {}

    return {
        "city": address.get("city", "Tbilisi"),
        "road": address.get("road"),
        "house": address.get("house"),
        "apartment": address.get("apartment"),
        "position": address.get("position") or getattr(obj, "map_link", None),
    }


# Функция для получения адреса объекта недвижимости. 
# Принимает объект недвижимости и возвращает словарь с адресными данными.
# Если адрес не задан, возвращает значения по умолчанию.