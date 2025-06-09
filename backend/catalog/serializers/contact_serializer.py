from rest_framework import serializers
from catalog.models import Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'phone']

    def create(self, validated_data):
        # При создании контакта проверяем, существует ли контакт с таким номером телефона
        phone = validated_data.get('phone')
        contact, created = Contact.objects.get_or_create(phone=phone, defaults=validated_data)
        return contact
