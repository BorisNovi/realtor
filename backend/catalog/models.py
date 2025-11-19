from django.utils import timezone
from django.db import models
from contacts.models import Contact

class PropertyStatus(models.TextChoices):
    AVAILABLE = 'available', 
    RESERVED = 'reserved', 
    RENTED = 'rented', 

class BaseProperty(models.Model):
    PROPERTY_TYPE = None

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    @property # Виртуальное/вычисляемое поле
    def property_type(self):
        """Возвращает тип объекта недвижимости"""
        return self.PROPERTY_TYPE
    
    photos = models.JSONField(default=list)
    address = models.JSONField()
    price_value = models.DecimalField(max_digits=12, decimal_places=2)
    price_currency = models.CharField(max_length=3, default="USD")
    area = models.DecimalField(max_digits=7, decimal_places=2)
    date_added = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=PropertyStatus.choices, default=PropertyStatus.AVAILABLE)
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name="%(class)ss",
        null=True,
        blank=True
    )
    comment = models.TextField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True 

# Модель для квартир
class Flat(BaseProperty):
    PROPERTY_TYPE = "flat"

    # specifics
    rooms = models.IntegerField(null=True, blank=True)
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    zoning_type = models.CharField(max_length=50, null=True, blank=True)
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
