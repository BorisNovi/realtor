from colorama import Fore
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from realtor.settings import MAX_FILES
from file.file_utils import make_files_permanent
from rest_framework import serializers

User = get_user_model()

# Сериализатор для профиля
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'company_logo', 'company_name', 'date_added', 'role']
        read_only_fields = ['date_added', 'role']

    def update(self, instance, validated_data):
        logo = validated_data.get('company_logo')
        if logo and logo != instance.company_logo:
            instance.company_logo = make_files_permanent(logo)

        instance.company_name = validated_data.get('company_name', instance.company_name)
        instance.save()
        return instance


# Сериализатор для смены пароля
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    new_password_confirmation = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        user = self.context['request'].user

        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({'old_password': 'Неверный текущий пароль'})

        if attrs['new_password'] != attrs['new_password_confirmation']:
            raise serializers.ValidationError({'new_password': 'Пароли не совпадают'})

        validate_password(attrs['new_password'], user)
        return attrs

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user




