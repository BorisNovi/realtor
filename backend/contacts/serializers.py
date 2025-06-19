from rest_framework import serializers
from contacts.models import Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'phone']

    def create(self, validated_data):
        phone = validated_data.get('phone')
        if Contact.objects.filter(phone=phone).exists():
            raise serializers.ValidationError(f"Contact with phone {phone} already exists.")
        contact = Contact.objects.create(**validated_data)
        return contact


    def update(self, instance, validated_data):
        new_phone = validated_data.get('phone', instance.phone)
        
        # Check if phone changed and already exists on another contact
        if new_phone != instance.phone:
            if Contact.objects.filter(phone=new_phone).exclude(pk=instance.pk).exists():
                raise serializers.ValidationError(f"Phone number {new_phone} is already used by another contact.")
        
        instance.name = validated_data.get('name', instance.name)
        instance.phone = new_phone
        instance.save()
        return instance

