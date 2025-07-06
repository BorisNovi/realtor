def get_price(obj):
    """
    Returns price dict from price_value and price_currency fields.
    """
    return {
        "value": float(obj.price_value) if obj.price_value is not None else None,
        "currency": obj.price_currency or "USD"
    }
