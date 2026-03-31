# Тут лежит общий список специфик. 
# теперь у всех объектов специфики одни, но на фронте выдаются в зависимости от типа. 

# Раскладывает специфики в плоский объект для ответа на гет-запрос
def flatten_specifics(specifics: dict | None) -> dict:
    specifics = specifics or {}
    result = {}

    # floor
    floor = specifics.get('floor') or {}
    result['floor_current'] = floor.get('current')
    result['floor_full'] = floor.get('full')

    # options
    options = specifics.get('options') or {}

    # sharedFacilities
    shared = options.get('shared_facilities') or {}
    result['shared_kitchen'] = shared.get('kitchen', False)
    result['shared_bathroom'] = shared.get('bathroom', False)

    # utilities
    utilities = options.get('utilities') or {}
    result['electricity'] = utilities.get('electricity', False)
    result['water_supply'] = utilities.get('water_supply', False)
    result['natural_gas'] = utilities.get('natural_gas', False)
    result['sewerage'] = utilities.get('sewerage', False)
    result['internet'] = utilities.get('internet', False)

    # other
    other = options.get('other') or {}
    result['parking'] = other.get('parking', False)
    result['bath'] = other.get('bath', False)
    result['shower'] = other.get('shower', False)
    result['air_conditioning'] = other.get('air_conditioning', False)
    result['fireplace'] = other.get('fireplace', False)
    result['beautiful_view'] = other.get('beautiful_view', False)
    result['new_building'] = other.get('new_building', False)
    result['elevator'] = other.get('elevator', False)
    result['balcony'] = other.get('balcony', False)
    result['garden'] = other.get('garden', False)
    result['garage'] = other.get('garage', False)

    # простые поля
    result['rooms'] = specifics.get('rooms')
    result['kitchen_type'] = specifics.get('kitchen')
    result['heating'] = specifics.get('heating')
    result['furnished'] = specifics.get('furnished')
    result['renovation'] = specifics.get('renovation')

    return result


def build_specifics(obj):
    return {
        "rooms": getattr(obj, "rooms", None),
        "floor": {
            "current": getattr(obj, "floor_current", None),
            "full": getattr(obj, "floor_full", None)
        },
        "kitchen": getattr(obj, "kitchen_type", None),
        "heating": getattr(obj, "heating", None),
        "furnished": getattr(obj, "furnished", None),
        "renovation": getattr(obj, "renovation", None),
        "options": {
            "sharedFacilities": {
                "kitchen": getattr(obj, "shared_kitchen", False),
                "bathroom": getattr(obj, "shared_bathroom", False)
            },
            "utilities": {
                "electricity": getattr(obj, "electricity", False),
                "waterSupply": getattr(obj, "water_supply", False),
                "naturalGas": getattr(obj, "natural_gas", False),
                "sewerage": getattr(obj, "sewerage", False),
                "internet": getattr(obj, "internet", False)
            },
            "other": {
                "parking": getattr(obj, "parking", False),
                "bath": getattr(obj, "bath", False),
                "shower": getattr(obj, "shower", False),
                "airConditioning": getattr(obj, "air_conditioning", False),
                "fireplace": getattr(obj, "fireplace", False),
                "beautifulView": getattr(obj, "beautiful_view", False),
                "newBuilding": getattr(obj, "new_building", False),
                "elevator": getattr(obj, "elevator", False),
                "balcony": getattr(obj, "balcony", False),
                "garden": getattr(obj, "garden", False),
                "garage": getattr(obj, "garage", False)
            }
        }
    }