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
        "rooms": obj.rooms,
        "floor": {"current": obj.floor_current, "full": obj.floor_full},
        "kitchen": obj.kitchen_type,
        "heating": obj.heating,
        "furnished": obj.furnished,
        "renovation": obj.renovation,
        "options": {
            "sharedFacilities": {
                "kitchen": obj.shared_kitchen,
                "bathroom": obj.shared_bathroom
            },
            "utilities": {
                "electricity": obj.electricity,
                "waterSupply": obj.water_supply,
                "naturalGas": obj.natural_gas,
                "sewerage": obj.sewerage,
                "internet": obj.internet
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
                "garage": obj.garage
            }
        }
    }