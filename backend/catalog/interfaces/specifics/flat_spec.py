from catalog.utils.string_utils import dict_keys_to_camelcase

def get_flat_specifics(obj):
    specifics = {
        "rooms": obj.rooms,
        "floor": {
            "current": obj.floor_current,
            "full": obj.floor_full,
        },
        "heating": obj.heating,
        "renovation": obj.renovation,
        "furnished": obj.furnished,
        "kitchen": obj.kitchen_type,
        "shared_facilities": {  # ключи snake_case в словаре, функция их конвертирует
            "kitchen": obj.shared_kitchen,
            "bathroom": obj.shared_bathroom,
        },
        "utilities": {
            "electricity": obj.has_electricity,
            "water_supply": obj.has_water,
            "natural_gas": obj.has_gas,
            "sewerage": obj.has_sewerage,
            "internet": obj.has_internet,
        },
        "options": {
            "bath": obj.bath,
            "shower": obj.shower,
            "air_conditioning": obj.air_conditioning,
            "fireplace": obj.fireplace,
            "beautiful_view": obj.beautiful_view,
            "new_building": obj.new_building,
            "elevator": obj.elevator,
        }
    }
    return dict_keys_to_camelcase(specifics)
