from django.utils import timezone
from django.db import models
from contacts.models import Contact

class PropertyStatus(models.TextChoices):
    AVAILABLE = 'available', 
    RESERVED = 'reserved', 
    RENTED = 'rented', 


class BaseProperty(models.Model):
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    photos = models.JSONField(default=list)
    
    address = models.JSONField()

    price_value = models.DecimalField(max_digits=12, decimal_places=2)
    price_currency = models.CharField(max_length=3, default="USD")

    area = models.DecimalField(max_digits=7, decimal_places=2)
    date_added = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=PropertyStatus.choices, default=PropertyStatus.AVAILABLE)

    comment = models.TextField(blank=True, null=True)

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True 

# Модель для квартир
class Flat(BaseProperty):
    # specifics
    rooms = models.IntegerField(null=True, blank=True)

    # specifics.floor
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)

    # specifics.kitchen
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    
    # specifics.zoning
    zoning_type = models.CharField(max_length=50, null=True, blank=True)
    
    # specifics.heating (тип, не булево)
    heating = models.CharField(max_length=50, null=True, blank=True)

    # specifics.furnished
    furnished = models.CharField(max_length=50, null=True, blank=True)

    # specifics.renovation
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

    # === CONTACT ===
    contact = models.ForeignKey(
        Contact,
        on_delete=models.CASCADE,
        related_name="flats",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Квартира – {self.address} ({self.price_value} {self.price_currency})"
    
    @property
    def property_type(self):
        return "flat"

class Office(BaseProperty):
    """ Модель для офисов """
    floor = models.PositiveIntegerField()
    open_space = models.BooleanField(default=False)
    meeting_rooms = models.PositiveIntegerField(default=0)
    contact = models.ForeignKey(
        Contact, 
        on_delete=models.CASCADE, 
        related_name="offices", 
        null=True, 
        blank=True)


    def __str__(self):
        return f"Офис – {self.address} ({self.price_value} {self.price_currency})"
    @property
    def property_type(self):
        return "office"

class LandPlot(BaseProperty):
    """ Модель для земельных участков """
    is_agricultural = models.BooleanField(default=False)
    has_communications = models.BooleanField(default=False)
    contact = models.ForeignKey(
        Contact, 
        on_delete=models.CASCADE, 
        related_name="landlots", 
        null=True, 
        blank=True)


    def __str__(self):
        return f"Земельный участок – {self.address} ({self.price_value} {self.price_currency})"
    @property
    def property_type(self):
        return "landplot"


