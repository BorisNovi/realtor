# catalog/parsers/specifics_parser.py

def parse_bool(val):
    """Converts various representations of true/false to real bool."""
    return str(val).lower() in ['1', 'true', 'yes', 'on']


def flatten_flat_specifics(specifics: dict) -> dict:
    result = {}

    if not specifics:
        return result

    # Flat-specific logic
    result['rooms'] = specifics.get('rooms')

    floor = specifics.get('floor', {})
    result['floor_current'] = floor.get('current')
    result['floor_full'] = floor.get('full')

    result['kitchen_type'] = specifics.get('kitchen')
    result['heating'] = specifics.get('heating')
    result['renovation'] = specifics.get('renovation')
    result['furnished'] = specifics.get('furnished')

    options = specifics.get('options', {})

    shared = options.get('sharedFacilities', {})
    result['shared_kitchen'] = bool(shared.get('kitchen', False))   # ТУТ КАКАЯ-ТО ХУЙНЯ
    result['shared_bathroom'] = bool(shared.get('bathroom', False))  # И ТУТ КАКАЯ-ТО ХУЙНЯ

    utils = options.get('utilities', {})
    result['electricity'] = bool(utils.get('electricity', False))
    result['water_supply'] = bool(utils.get('water_supply', False))
    result['natural_gas'] = bool(utils.get('natural_gas', False))
    result['sewerage'] = bool(utils.get('sewerage', False))
    result['internet'] = bool(utils.get('internet', False))

    other = options.get('other', {})
    result['air_conditioning'] = bool(other.get('air_conditioning', False))
    result['beautiful_view'] = bool(other.get('beautiful_view', False))
    result['new_building'] = bool(other.get('new_building', False))

    # Эти можно просто как есть
    for key in ['parking', 'bath', 'shower', 'elevator', 'balcony', 'garden', 'garage', 'fireplace']:
        result[key] = bool(other.get(key, False))

    return result



PARSERS_BY_TYPE = {
    'flat': flatten_flat_specifics,
    # 'office': flatten_office_specifics,
    # 'landplot': flatten_landplot_specifics,
}


def flatten_specifics(property_type: str, specifics: dict) -> dict:
    parser = PARSERS_BY_TYPE.get(property_type)
    if not parser:
        raise ValueError(f"No parser implemented for property_type '{property_type}'")
    return parser(specifics)
