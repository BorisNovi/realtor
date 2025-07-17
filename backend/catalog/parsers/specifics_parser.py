# catalog/parsers/specifics_parser.py

def flatten_flat_specifics(specifics: dict) -> dict:
    result = {}

    if not specifics:
        return result

    # flat-specific logic
    if 'rooms' in specifics:
        result['rooms'] = specifics['rooms']

    floor = specifics.get('floor', {})
    result['floor_current'] = floor.get('current')
    result['floor_full'] = floor.get('full')

    if 'kitchen' in specifics:
        result['kitchen_type'] = specifics['kitchen']
    if 'heating' in specifics:
        result['heating'] = specifics['heating']
    if 'renovation' in specifics:
        result['renovation'] = specifics['renovation']
    if 'furnished' in specifics:
        result['furnished'] = specifics['furnished']

    options = specifics.get('options', {})

    shared = options.get('sharedFacilities', {})
    result['shared_kitchen'] = shared.get('kitchen', False)
    result['shared_bathroom'] = shared.get('bathroom', False)

    utils = options.get('utilities', {})
    result['electricity'] = utils.get('electricity', False)
    result['water_supply'] = utils.get('waterSupply', False)
    result['natural_gas'] = utils.get('naturalGas', False)
    result['sewerage'] = utils.get('sewerage', False)
    result['internet'] = utils.get('internet', False)

    other = options.get('other', {})
    result['parking'] = other.get('parking', False)
    result['bath'] = other.get('bath', False)
    result['shower'] = other.get('shower', False)
    result['air_conditioning'] = other.get('airConditioning', False)
    result['fireplace'] = other.get('fireplace', False)
    result['beautiful_view'] = other.get('beautifulView', False)
    result['new_building'] = other.get('newBuilding', False)
    result['elevator'] = other.get('elevator', False)
    result['balcony'] = other.get('balcony', False)
    result['garden'] = other.get('garden', False)
    result['garage'] = other.get('garage', False)

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
