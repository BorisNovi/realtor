# listings/listing_serializers.py
import secrets
from django.db import transaction
from rest_framework import serializers
from catalog.views.create_update_object_view import PROPERTY_READ_SERIALIZER_MAP
from catalog.catalog_models import Property 
from listings.models import Listing

# === СЕРИАЛИЗАТОР ЛИСТИНГОВ ===
class ListingSerializer(serializers.ModelSerializer):
    property_object_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1)
    )
    public_link = serializers.JSONField(required=False)
    property_objects = serializers.SerializerMethodField()
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    # Добавляем новые поля для компании
    company_name = serializers.SerializerMethodField()
    company_logo = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id', 
            'name', 
            'company_name', 
            'company_logo', 
            'public_link',
            'date_added',
            'property_object_ids',
            'property_objects', 
            'user'
            ] 
        read_only_fields = [
            'id', 
            'date_added', 
            'property_objects',
            'user',
            ]

    # Ищем запрашиваемые объекты
    def get_property_objects(self, obj):
        """Обращается к таблице за искомыми объектами по всей базе. 
        Получает их ID из поля property_object_ids, сериализует через нужный сериализатор и возвращает словарь."""
        
        properties = Property.objects.filter(
            id__in=obj.property_object_ids,
            is_deleted=False
        )

        return [
            PROPERTY_READ_SERIALIZER_MAP[p.get_real_instance().property_type](
                p.get_real_instance(),
                context=self.context
            ).data
            for p in properties
        ]

    # Берем имя компании через пользователя
    def get_company_name(self, obj):
        if obj.user:
            return obj.user.company_name
        return None

    # Берем логотип компании через пользователя
    def get_company_logo(self, obj):
        if obj.user:
            return obj.user.company_logo
        return None

    # Ручная валидация поля property_object_ids, чтобы убедиться, что все фронт не шлет хуйню
    def validate_property_object_ids(self, ids):
        if not isinstance(ids, list):
            raise serializers.ValidationError("Должен быть список")
        if not all(isinstance(i, int) for i in ids):
            raise serializers.ValidationError("Все элементы должны быть числами")
        return ids
        

    # -------------------- ЛОГИКА ГЕНЕРАЦИИ PUBLIC LINK --------------------
    def _generate_token(self) -> str:
        """Генерируем токен для листинга."""
        return secrets.token_urlsafe(8)

    def _get_public_link(self, listing: Listing, available=True) -> dict:
        """Возвращает объект public_link с токеном и статусом."""
        # Если токен уже есть, берём его, иначе генерируем
        token = listing.public_link.get("token") if listing.public_link else self._generate_token()
        return {
            "available": available,
            "token": token
        }


    @transaction.atomic
    def create(self, validated_data):
        public = validated_data.pop("public_link", {})
        listing = super().create(validated_data)

        available = public.get("available") in (True, "True", "true", 1, "1")
        listing.public_link = self._get_public_link(listing, available=available)
        listing.save()

        return listing

    @transaction.atomic
    def update(self, instance, validated_data):
        public = validated_data.pop("public_link", None)
        listing = super().update(instance, validated_data)

        if public is not None:
            available = public.get("available") in (True, "True", "true", 1, "1")
            listing.public_link = self._get_public_link(listing, available=available)
            listing.save()

        return listing

