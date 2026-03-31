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
    "address_region": {"csv": "Region", "required": False},
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
    
    # Specifics (поля со всех дочерних типов)
    "rooms": {"csv": "Rooms", "required": False},
    "floor_current": {"csv": "Floor", "required": False},
    "floor_full": {"csv": "Total Floors", "required": False},
    "kitchen_type": {"csv": "Kitchen Type", "required": False},
    "heating": {"csv": "Heating", "required": False},
    "furnished": {"csv": "Furnished", "required": False},
    "renovation": {"csv": "Renovation", "required": False},

    # Shared facilities
    "shared_kitchen": {"csv": "Shared Kitchen", "required": False},
    "shared_bathroom": {"csv": "Shared Bathroom", "required": False},

    # Utilities
    "electricity": {"csv": "Electricity", "required": False},
    "water_supply": {"csv": "Water Supply", "required": False},
    "natural_gas": {"csv": "Natural Gas", "required": False},
    "sewerage": {"csv": "Sewerage", "required": False},
    "internet": {"csv": "Internet", "required": False},

    # Options
    "bath": {"csv": "Bath", "required": False},
    "shower": {"csv": "Shower", "required": False},
    "air_conditioning": {"csv": "Air Conditioning", "required": False},
    "fireplace": {"csv": "Fireplace", "required": False},
    "beautiful_view": {"csv": "Beautiful View", "required": False},
    "new_building": {"csv": "New Building", "required": False},
    "elevator": {"csv": "Elevator", "required": False},

    # Other options
    "parking": {"csv": "Parking", "required": False},
    "balcony": {"csv": "Balcony", "required": False},
    "garden": {"csv": "Garden", "required": False},
    "garage": {"csv": "Garage", "required": False},
}

CSV_TO_FIELD = {v["csv"]: k for k, v in HEADERS.items()}
REQUIRED_HEADERS = {v["csv"] for v in HEADERS.values() if v.get("required")}