from django.utils import timezone
from django.db import models
from contacts.models import Contact
from polymorphic.models import PolymorphicModel
from users.models import User

class PropertyStatus(models.TextChoices):
    AVAILABLE = 'available', 
    RESERVED = 'reserved', 
    RENTED = 'rented', 

class ZoningType(models.TextChoices):
    RESIDENTIAL = 'residential', 'Residential'
    COMMERCIAL = 'commercial', 'Commercial'
    AGRICULTURAL = 'agricultural', 'Agricultural'
    MIXED = 'mixed', 'Mixed'

# Абстрактная базовая модель для объектов недвижимости
class Property(PolymorphicModel):
    name = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=10, choices=PropertyStatus.choices, default=PropertyStatus.AVAILABLE)
    photos = models.JSONField(default=list)
    address = models.JSONField() # [lng, lat]
    zoning_type = models.CharField(max_length=20, choices=ZoningType.choices, default=ZoningType.RESIDENTIAL)
    price_value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    price_currency = models.CharField(max_length=3, default="USD")
    area = models.DecimalField(max_digits=7, decimal_places=2)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.SET_NULL,  # оставляем объект, если контакт удалён
        related_name="%(class)ss",
        null=True,                   # база допускает NULL
        blank=True                   # форма/админка допускает пустое поле
    )
    comment = models.TextField(blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    @property
    def property_type(self):
        return self.polymorphic_ctype.model

    class Meta:
        ordering = ['-date_added']


# Модель для квартир
class Flat(Property):
    # specifics
    rooms = models.IntegerField(null=True, blank=True)
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    heating = models.CharField(max_length=50, null=True, blank=True)
    furnished = models.CharField(max_length=50, null=True, blank=True)
    renovation = models.CharField(max_length=50, null=True, blank=True)

    # specifics.sharedFacilities
    shared_kitchen = models.BooleanField(default=False)
    shared_bathroom = models.BooleanField(default=False)

    # specifics.utilities
    electricity = models.BooleanField(default=False)
    water_supply = models.BooleanField(default=False)
    natural_gas = models.BooleanField(default=False)
    sewerage = models.BooleanField(default=False)
    internet = models.BooleanField(default=False)

    # specifics.options
    bath = models.BooleanField(default=False)
    shower = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    fireplace = models.BooleanField(default=False)
    beautiful_view = models.BooleanField(default=False)
    new_building = models.BooleanField(default=False)
    elevator = models.BooleanField(default=False)

    # specifics.options.other
    parking = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    garage = models.BooleanField(default=False)

# Модель для домов
class House(Property):
    # specifics
    rooms = models.IntegerField(null=True, blank=True)
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    heating = models.CharField(max_length=50, null=True, blank=True)
    furnished = models.CharField(max_length=50, null=True, blank=True)
    renovation = models.CharField(max_length=50, null=True, blank=True)

    # specifics.sharedFacilities
    shared_kitchen = models.BooleanField(default=False)
    shared_bathroom = models.BooleanField(default=False)

    # specifics.utilities
    electricity = models.BooleanField(default=False)
    water_supply = models.BooleanField(default=False)
    natural_gas = models.BooleanField(default=False)
    sewerage = models.BooleanField(default=False)
    internet = models.BooleanField(default=False)

    # specifics.options
    bath = models.BooleanField(default=False)
    shower = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    fireplace = models.BooleanField(default=False)
    beautiful_view = models.BooleanField(default=False)
    new_building = models.BooleanField(default=False)
    elevator = models.BooleanField(default=False)

    # specifics.options.other
    parking = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    garage = models.BooleanField(default=False)

# Модель для комнат
class Room(Property):
 
    # specifics
    rooms = models.IntegerField(null=True, blank=True)
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    heating = models.CharField(max_length=50, null=True, blank=True)
    furnished = models.CharField(max_length=50, null=True, blank=True)
    renovation = models.CharField(max_length=50, null=True, blank=True)

    # specifics.sharedFacilities
    shared_kitchen = models.BooleanField(default=False)
    shared_bathroom = models.BooleanField(default=False)

    # specifics.utilities
    electricity = models.BooleanField(default=False)
    water_supply = models.BooleanField(default=False)
    natural_gas = models.BooleanField(default=False)
    sewerage = models.BooleanField(default=False)
    internet = models.BooleanField(default=False)

    # specifics.options
    bath = models.BooleanField(default=False)
    shower = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    fireplace = models.BooleanField(default=False)
    beautiful_view = models.BooleanField(default=False)
    new_building = models.BooleanField(default=False)
    elevator = models.BooleanField(default=False)

    # specifics.options.other
    parking = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    garage = models.BooleanField(default=False)

# Модель для офисов
class Office(Property):
 
    # specifics
    rooms = models.IntegerField(null=True, blank=True)
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    heating = models.CharField(max_length=50, null=True, blank=True)
    furnished = models.CharField(max_length=50, null=True, blank=True)
    renovation = models.CharField(max_length=50, null=True, blank=True)

    # specifics.sharedFacilities
    shared_kitchen = models.BooleanField(default=False)
    shared_bathroom = models.BooleanField(default=False)

    # specifics.utilities
    electricity = models.BooleanField(default=False)
    water_supply = models.BooleanField(default=False)
    natural_gas = models.BooleanField(default=False)
    sewerage = models.BooleanField(default=False)
    internet = models.BooleanField(default=False)

    # specifics.options
    bath = models.BooleanField(default=False)
    shower = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    fireplace = models.BooleanField(default=False)
    beautiful_view = models.BooleanField(default=False)
    new_building = models.BooleanField(default=False)
    elevator = models.BooleanField(default=False)

    # specifics.options.other
    parking = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    garage = models.BooleanField(default=False)

# Модель для земельных участков
class Land(Property):
 
    # specifics
    rooms = models.IntegerField(null=True, blank=True)
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    heating = models.CharField(max_length=50, null=True, blank=True)
    furnished = models.CharField(max_length=50, null=True, blank=True)
    renovation = models.CharField(max_length=50, null=True, blank=True)

    # specifics.sharedFacilities
    shared_kitchen = models.BooleanField(default=False)
    shared_bathroom = models.BooleanField(default=False)

    # specifics.utilities
    electricity = models.BooleanField(default=False)
    water_supply = models.BooleanField(default=False)
    natural_gas = models.BooleanField(default=False)
    sewerage = models.BooleanField(default=False)
    internet = models.BooleanField(default=False)

    # specifics.options
    bath = models.BooleanField(default=False)
    shower = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    fireplace = models.BooleanField(default=False)
    beautiful_view = models.BooleanField(default=False)
    new_building = models.BooleanField(default=False)
    elevator = models.BooleanField(default=False)

    # specifics.options.other
    parking = models.BooleanField(default=False)
    balcony = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)
    garage = models.BooleanField(default=False)

# TODO: добавить модели для гаражей, складов и т.д.