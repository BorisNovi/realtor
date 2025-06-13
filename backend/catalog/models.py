from django.utils import timezone
from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.name} ({self.phone})"

class PropertyStatus(models.TextChoices):
    AVAILABLE = 'available', 
    RESERVED = 'reserved', 
    RENTED = 'rented', 


class BaseProperty(models.Model):
    """ Базовая модель недвижимости с общими полями """
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    photos = models.JSONField(default=list)
    address = models.CharField(max_length=255)
    map_link = models.URLField(blank=True, null=True)

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

class Flat(BaseProperty):
    """ Модель для квартир """
    rooms = models.IntegerField(null=True, blank=True)
    floor_current = models.PositiveIntegerField(null=True, blank=True)
    floor_full = models.PositiveIntegerField(null=True, blank=True)

    bath = models.BooleanField(default=False)
    shower = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    heating = models.BooleanField(default=False)
    fireplace = models.BooleanField(default=False)
    beautiful_view = models.BooleanField(default=False)
    new_building = models.BooleanField(default=False)
    elevator = models.BooleanField(default=False)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="flats")

    # Дополнительно для соответствия интерфейсу
    kitchen_type = models.CharField(max_length=50, null=True, blank=True)
    renovation = models.CharField(max_length=50, null=True, blank=True)
    furnished = models.CharField(max_length=50, null=True, blank=True)

    shared_kitchen = models.BooleanField(default=False)
    shared_bathroom = models.BooleanField(default=False)

    has_electricity = models.BooleanField(default=False)
    has_water = models.BooleanField(default=False)
    has_gas = models.BooleanField(default=False)
    has_sewerage = models.BooleanField(default=False)
    has_internet = models.BooleanField(default=False)

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
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="offices")

    def __str__(self):
        return f"Офис – {self.address} ({self.price_value} {self.price_currency})"
    @property
    def property_type(self):
        return "office"

class LandPlot(BaseProperty):
    """ Модель для земельных участков """
    is_agricultural = models.BooleanField(default=False)
    has_communications = models.BooleanField(default=False)
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name="landplots")

    def __str__(self):
        return f"Земельный участок – {self.address} ({self.price_value} {self.price_currency})"
    @property
    def property_type(self):
        return "landplot"


