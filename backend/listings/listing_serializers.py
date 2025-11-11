from colorama import Fore
from rest_framework import serializers
from listings.models import Listing
from djangorestframework_camel_case.util import underscoreize
from catalog.models import BaseProperty, Flat 
from .flat_test_serializer import FlatTestSerializer

class ListingSerializer(serializers.ModelSerializer):
    # принимаем список ID вручную
    property_object_ids = serializers.ListField(
        child=serializers.IntegerField()
    )

    # поле для развёрнутых объектов. 
    property_objects = serializers.SerializerMethodField(read_only=True)
    
    # удобненько конвертируем ключи camelCase → snake_case 
    # ======= (ЗАМЕНЕНО НАСТРОЙКАМИ ДЖАНГО) =========
    # def to_internal_value(self, data):
    #     print(f"{Fore.CYAN}=== RAW DATA ==={Fore.RESET} \n", data)
    #     # data = underscoreize(data)
    #     print(f"{Fore.GREEN}=== CONVERTED DATA ==={Fore.RESET} \n", data)
    #     return super().to_internal_value(data)

    # Обращаемся к таблице за искомыми объектами:
    def get_property_objects(self, obj):
        # на текущий момент берём только квартиры
        flats = Flat.objects.filter(id__in=obj.property_object_ids)
        return FlatTestSerializer(flats, many=True).data
        # TODO: ДОБАВЬ ОСТАЛЬНЫЕ ПОТОМ

    class Meta:
        model = Listing
        fields = ['id', 
                  'name', 
                  'property_object_ids',
                  'property_objects', 
                #   'companyName', 
                #   'companyLogo', 
                #   'publicLink'
                  ] 

    # Валидируем название подборки
    # TODO: ВЕРНУТЬ ПРОВЕРКУ, НО СДЕЛАТЬ ЧЕРЕЗ АТРИБУТЫ (ДЛЯ КАЖДОГО ПОЛЯ СВОЮ)
    # def validate_name(self, attr):
    #     if not value in attr['name'].lower():
    #         raise serializers.ValidationError("❌🗨️ Название листинга не может быть пустым.")

    #     if len(value) < 3:
    #         raise serializers.ValidationError("❌ Название листинга должно содержать не менее 3 символов.")
    #     if len(value) > 100:
    #         raise serializers.ValidationError("❌ Название листинга не должно превышать 100 символов.")
        
    #     if Listing.objects.filter(name=value).exists():
    #         raise serializers.ValidationError("❌ Листинг с таким названием уже существует.")
        
    #     return value
