# Словарик заголовков. 
HEADERS = {
    "id": {"csv": "ID", "required": False},
    "property_type": {"csv": "Property Type", "required": True},
    "name": {"csv": "Name", "required": False},
    "status": {"csv": "Status", "required": False, "default": "available"},
    "zoning_type": {"csv": "Zoning Type", "required": False, "default": "residential"},
    "price_value": {"csv": "Price", "required": True},
    "price_currency": {"csv": "Currency", "required": True},
    "area": {"csv": "Area", "required": False, "default": 0},
    
    "address_country": {"csv": "Country", "required": True},
    "address_region": {"csv": "Region", "required": True},
    "address_city": {"csv": "City", "required": True}, 
    "address_road": {"csv": "Street", "required": True},
    "address_house": {"csv": "House", "required": True},
    "address_apartment": {"csv": "Apartment", "required": False},
    "address_lng": {"csv": "Longitude", "required": False},
    "address_lat": {"csv": "Latitude", "required": False},
    
    "contact_name": {"csv": "Contact Name", "required": False},
    "contact_phone": {"csv": "Contact Phone", "required": False},
    "contact_additional_phone": {"csv": "Contact Additional Phone", "required": False},
    "contact_comment": {"csv": "Contact Comment", "required": False},
    
    "comment": {"csv": "Comment", "required": False},
    "date_added": {"csv": "Date Added", "required": False},
}

CSV_TO_FIELD = {v["csv"]: k for k, v in HEADERS.items()}
REQUIRED_HEADERS = {v["csv"] for v in HEADERS.values() if v.get("required")}