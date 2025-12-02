# listings/listing_serializers.py

import secrets
from colorama import Fore
from listings.models import Listing
from catalog.catalog_models import Flat 
from rest_framework import serializers
from catalog.serializers.flat_serializer import FlatSerializer

# === СЕРИАЛИЗАТОР ЛИСТИНГОВ ===
class ListingSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Listing."""

    property_object_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1)
    )

    property_objects = serializers.SerializerMethodField(read_only=True) # поле для развёрнутых объектов. 
    public_link = serializers.JSONField(required=False)

    # Обращаемся к таблице за искомыми объектами:
    def get_property_objects(self, obj):
        # на текущий момент берём только квартиры
        flats = Flat.objects.filter(id__in=obj.property_object_ids)
        return FlatSerializer(flats, many=True).data
        # TODO: ДОБАВЬ ОСТАЛЬНЫЕ ПОТОМ

    class Meta:
        model = Listing
        fields = ['id', 
                  'name', 
                  'property_object_ids',
                  'property_objects', 
                  'company_name', 
                  'company_logo', 
                  'public_link'
                  ] 


    # -------------------- ВАЛИДАЦИИ --------------------

    def validate_name(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError("Название должно быть не короче 3 символов.")
        if len(value) > 100:
            raise serializers.ValidationError("Название должно быть не длиннее 100 символов.")

        qs = Listing.objects.filter(name=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError("Такое название уже используется.")

        return value

    def validate_company_logo(self, value):
        if value and not value.startswith("http"):
            raise serializers.ValidationError("company_logo должен быть валидным URL.")
        return value

    def validate_property_object_ids(self, ids):
        existing = list(Flat.objects.filter(id__in=ids).values_list("id", flat=True))

        missing = set(ids) - set(existing)
        if missing:
            raise serializers.ValidationError(f"Объекты не найдены: {list(missing)}")

        return ids

    # -------------------- ЛОГИКА ГЕНЕРАЦИИ PUBLIC LINK --------------------
    
    def _generate_public_link(self, listing: Listing) -> dict:
        token = secrets.token_urlsafe(8)
        
        base = "https://realtor-x.com/listing"
        return {
            "available": True,
            "url": f"{base}/{token}"
        }

    # -------------------- СОЗДАНИЕ --------------------

    def create(self, validated_data):
        public = validated_data.pop("public_link", {})
        listing = super().create(validated_data)

        if public.get("available") in (True, "True", "true", 1, "1"):
            listing.public_link = self._generate_public_link(listing)
            listing.save()

        return listing

    # -------------------- ОБНОВЛЕНИЕ --------------------

    def update(self, instance, validated_data):
        public = validated_data.pop("public_link", None)
        listing = super().update(instance, validated_data)

        if public is not None:
            if public.get("available") in (True, "True", "true", 1, "1"):
                listing.public_link = self._generate_public_link(listing)
            else:
                listing.public_link = {"available": False}
            listing.save()

        return listing
