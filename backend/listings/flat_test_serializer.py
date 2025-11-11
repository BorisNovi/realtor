from rest_framework import serializers
from catalog.models import Flat

class FlatTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flat
        fields = '__all__'

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
                        "kitchen": data.get("shared_kitchen"),
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
