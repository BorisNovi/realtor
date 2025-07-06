def get_address(obj):
    """
    Converts address string like "Rustaveli 14" into structured address dict.
    """

    raw_address = obj.address or ""
    parts = raw_address.strip().split()

    road = None
    house_number = None

    if parts:
        if parts[-1].isdigit():
            house_number = parts[-1]
            road = " ".join(parts[:-1])
        else:
            road = " ".join(parts)

    return {
        "city": "Tbilisi",  # пока по дефолту
        "road": road,
        "house_number": house_number,
        "position": getattr(obj, "map_link", None),
    }
