from catalog.interfaces.address import get_address
from catalog.interfaces.price import get_price
from catalog.interfaces.contact import get_contact
from catalog.interfaces.specifics import get_specifics

# Возвращает ВСЕ свойства объекта недвижимости при создании/запросе единичного объекта
def format_property(obj):
    return {
        "id": obj.id,
        "photos": obj.photos,
        "propertyType": getattr(obj, "property_type", "flat"),
        "zoningType": getattr(obj, "zoning_type", "residential"),
        "status": obj.status,
        "address": get_address(obj),
        "price": get_price(obj),
        "area": float(obj.area) if obj.area else None,
        "dateAdded": obj.date_added,
        "contact": get_contact(obj.contact) if obj.contact else None, 
        "comment": obj.comment,
        "specifics": get_specifics(obj), 
    }

# Возвращает обобщенные сведения о недвижимости для отображения в списке
def format_list_property(obj):
    return {
        "id": obj.id,
        "photos": obj.photos,
        "propertyType": getattr(obj, "property_type", "flat"),
        "zoningType": getattr(obj, "zoning_type", "residential"),
        "status": obj.status,
        "address": get_address(obj),
        "price": get_price(obj),
        "area": float(obj.area) if obj.area else None,
        "dateAdded": obj.date_added,
        "contact": get_contact(obj.contact) if obj.contact else None,
    }
