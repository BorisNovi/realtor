# interfaces/specifics/__init__.py

from catalog.interfaces.specifics.flat_spec import get_flat_specifics
# from interfaces.specifics.office_spec import get_office_specifics  # подключим позже
# from interfaces.specifics.landplot_spec import get_landplot_specifics  # позже

SPECIFICS_MAP = {
    "flat": get_flat_specifics,
    # "office": get_office_specifics,
    # "landplot": get_landplot_specifics,
    # "garage": get_garage_specifics,
}

def get_specifics(obj):
    property_type = getattr(obj, "property_type", None)
    handler = SPECIFICS_MAP.get(property_type)

    if handler:
        return handler(obj)
    return None
