def get_price(obj):
    return {
        "value": float(obj.price_value) if obj.price_value is not None else None,
        "currency": obj.price_currency or "USD"
    }
