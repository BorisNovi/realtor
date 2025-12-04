# catalog/serializers/flat_serializer.py
from rest_framework import serializers
from catalog.catalog_models import Flat

# Сериализатор для квартир
class FlatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = '__all__'

    # Отдаем фронту объект в нужном формате
    def to_representation(self, instance):
        data = super().to_representation(instance)

        return {
            "id": data.get("id"),
            "photos": data.get("photos", []),
            "propertyType": "flat",
            "zoningType": data.get("zoning_type"),
            "status": data.get("status"),
            "address": {
                "city": data.get("address", {}).get("city") if isinstance(data.get("address"), dict) else None,
                "road": data.get("address", {}).get("road") if isinstance(data.get("address"), dict) else None,
                "house": data.get("address", {}).get("house") if isinstance(data.get("address"), dict) else None,
                "apartment": data.get("address", {}).get("apartment") if isinstance(data.get("address"), dict) else None,
                "position": data.get("address", {}).get("position") if isinstance(data.get("address"), dict) else None,
            },
            "price": {
                "value": float(data.get("price_value", 0)) if data.get("price_value") else None,
                "currency": data.get("price_currency"),
            },
            "area": float(data.get("area", 0)) if data.get("area") else None,
            "dateAdded": data.get("date_added"),
            "contact": {
                "id": data.get("contact"),
                "name": instance.contact.name if instance.contact else None,
                "phone": instance.contact.phone if instance.contact else None,
            },
            "comment": data.get("comment"),
            "specifics": {
                "heating": data.get("heating"),
                "rooms": data.get("rooms"),
                "floor": {
                    "current": data.get("floor_current"),
                    "full": data.get("floor_full"),
                },
                "renovation": data.get("renovation"),
                "furnished": data.get("furnished"),
                "kitchen": data.get("kitchen_type"),
                "options": {
                    "sharedFacilities": {
                        "kitchen": data.get("shared_kitchen"), # Здесь ОК - отдает в нужном виде. 
                        "bathroom": data.get("shared_bathroom"),
                    },
                    "utilities": {
                        "electricity": data.get("electricity"),
                        "waterSupply": data.get("water_supply"),
                        "naturalGas": data.get("natural_gas"),
                        "sewerage": data.get("sewerage"),
                        "internet": data.get("internet"),
                    },
                    "other": {
                        "parking": data.get("parking"),
                        "bath": data.get("bath"),
                        "shower": data.get("shower"),
                        "airConditioning": data.get("air_conditioning"),
                        "fireplace": data.get("fireplace"),
                        "beautifulView": data.get("beautiful_view"),
                        "newBuilding": data.get("new_building"),
                        "elevator": data.get("elevator"),
                        "balcony": data.get("balcony"),
                        "garden": data.get("garden"),
                        "garage": data.get("garage"),
                    },
                },
            },
        }
    
# Вспомогательная функция для подготовки данных из specifics для создания/обновления в общем сериализаторе.
def prepare_property_data(validated_data):
    """Возвращает распарсенные поля, готовые к применению к модели"""
    specifics = validated_data.pop('specifics', {}) or {}

    options = specifics.get("options", {}) or {}
    shared_facilities = options.get("shared_facilities", {}) or {}
    utilities = options.get("utilities", {}) or {}
    other = options.get("other", {}) or {}

    # Общие поля
    data = {
        "rooms": specifics.get("rooms"),
        "floor_current": specifics.get("floor", {}).get("current"),
        "floor_full": specifics.get("floor", {}).get("full"),
        "kitchen_type": specifics.get("kitchen"),
        "heating": specifics.get("heating"),
        "furnished": specifics.get("furnished"),
        "renovation": specifics.get("renovation"),
        # Shared Facilities
        "shared_kitchen": shared_facilities.get("kitchen", False),
        "shared_bathroom": shared_facilities.get("bathroom", False),
        # Utilities
        "electricity": utilities.get("electricity", False),
        "water_supply": utilities.get("water_supply", False),
        "natural_gas": utilities.get("natural_gas", False),
        "sewerage": utilities.get("sewerage", False),
        "internet": utilities.get("internet", False),
        # Other
        "bath": other.get("bath", False),
        "shower": other.get("shower", False),
        "air_conditioning": other.get("air_conditioning", False),
        "fireplace": other.get("fireplace", False),
        "beautiful_view": other.get("beautiful_view", False),
        "new_building": other.get("new_building", False),
        "elevator": other.get("elevator", False),
        "parking": other.get("parking", False),
        "balcony": other.get("balcony", False),
        "garden": other.get("garden", False),
        "garage": other.get("garage", False),
    }

    return data