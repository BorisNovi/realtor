from catalog.utils.string_utils import dict_keys_to_camelcase

def get_flat_specifics(obj):
    specifics = {
        "rooms": obj.rooms,
        "floor": {
            "current": obj.floor_current,
            "full": obj.floor_full,
        },
        "renovation": obj.renovation,
        "furnished": obj.furnished,
        "kitchen": obj.kitchen_type,
        "options": {
            "shared_facilities": {
                "kitchen": obj.shared_kitchen,
                "bathroom": obj.shared_bathroom,
            },
            "utilities": {
                "electricity": obj.electricity,
                "waterSupply": obj.water_supply,
                "naturalGas": obj.natural_gas,
                "sewerage": obj.sewerage,
                "internet": obj.internet,
            },
            "other": {
                "parking": obj.parking,
                "bath": obj.bath,
                "shower": obj.shower,
                "airConditioning": obj.air_conditioning,
                "fireplace": obj.fireplace,
                "beautifulView": obj.beautiful_view,
                "newBuilding": obj.new_building,
                "elevator": obj.elevator,
                "balcony": obj.balcony,
                "garden": obj.garden,
                "garage": obj.garage,
            },
        }
    }
    return dict_keys_to_camelcase(specifics)
