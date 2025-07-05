from rest_framework import serializers
from contacts.models import Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'phone']

    def create(self, validated_data):
        phone = validated_data.get('phone')
        name = validated_data.get('name')

        try:
            existing_contact = Contact.objects.get(phone=phone)
            if existing_contact.name != name:
                raise serializers.ValidationError(
                    f"Phone {phone} is already assigned to contact '{existing_contact.name}'."
                )
            return existing_contact
        except Contact.DoesNotExist:
            return Contact.objects.create(**validated_data)

    def update(self, instance, validated_data):
        new_phone = validated_data.get('phone', instance.phone)

        # Если пытаемся обновить номер телефона, проверяем его уникальность
        # и если он уже используется другим контактом, выбрасываем ошибку 
        if new_phone != instance.phone:
            if Contact.objects.filter(phone=new_phone).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError(
                    f"Phone number {new_phone} is already used by another contact."
                )

        instance.name = validated_data.get('name', instance.name)
        instance.phone = new_phone
        instance.save()
        return instance
