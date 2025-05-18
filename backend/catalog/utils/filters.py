from datetime import datetime

def apply_catalog_filters(objects, query_params):
    def filter_obj(obj):
        try:
            # Date added
            date_from = query_params.get("dateAdded[from]")
            date_to = query_params.get("dateAdded[to]")
            if date_from and obj.date_added.date() < datetime.strptime(date_from, "%Y-%m-%d").date():
                return False
            if date_to and obj.date_added.date() > datetime.strptime(date_to, "%Y-%m-%d").date():
                return False

            # Status
            status = query_params.get("status")
            if status and obj.status != status:
                return False

            # Property type
            property_types = query_params.getlist("propertyType")
            if property_types and obj.get_property_type_display() not in property_types:
                return False

            # Zoning type
            zoning_types = query_params.getlist("zoningType")
            if zoning_types and obj.zoning_type not in zoning_types:
                return False

            # Area
            area_min = query_params.get("area[min]")
            area_max = query_params.get("area[max]")
            if area_min and float(obj.area) < float(area_min):
                return False
            if area_max and float(obj.area) > float(area_max):
                return False

            # Price
            price_min = query_params.get("price[min]")
            price_max = query_params.get("price[max]")
            currency = query_params.get("price[currency]")

            if currency and obj.price_currency != currency:
                return False
            if price_min and obj.price_value < float(price_min):
                return False
            if price_max and obj.price_value > float(price_max):
                return False

        except Exception as e:
            print("Filtering error:", e)
            return False

        return True

    return list(filter(filter_obj, objects))
