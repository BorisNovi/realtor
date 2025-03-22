from django.db import models


class PropertyStatus(models.TextChoices):
    AVAILABLE = 'available', 'Доступно'
    RESERVED = 'reserved', 'Забронировано'
    RENTED = 'rented', 'Сдано'


class BaseProperty(models.Model):
    """ Базовая модель недвижимости с общими полями """
    photos = models.JSONField(default=list)
    address = models.CharField(max_length=255)
    map_link = models.URLField(blank=True, null=True)

    price_value = models.DecimalField(max_digits=12, decimal_places=2)
    price_currency = models.CharField(max_length=3, default="USD")

    area = models.DecimalField(max_digits=7, decimal_places=2)
    date_added = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=PropertyStatus.choices, default=PropertyStatus.AVAILABLE)

    comment = models.TextField(blank=True, null=True)

    class Meta:
        abstract = True  # Это базовая модель, она не создаёт таблицу в БД

class Flat(BaseProperty):
    """ Модель для квартир """
    rooms = models.PositiveIntegerField()
    floor_current = models.PositiveIntegerField()
    floor_full = models.PositiveIntegerField()

    bath = models.BooleanField(default=False)
    shower = models.BooleanField(default=False)
    air_conditioning = models.BooleanField(default=False)
    fireplace = models.BooleanField(default=False)
    beautiful_view = models.BooleanField(default=False)
    new_building = models.BooleanField(default=False)
    elevator = models.BooleanField(default=False)

    def __str__(self):
        return f"Квартира – {self.address} ({self.price_value} {self.price_currency})"

class Office(BaseProperty):
    """ Модель для офисов """
    floor = models.PositiveIntegerField()
    open_space = models.BooleanField(default=False)
    meeting_rooms = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Офис – {self.address} ({self.price_value} {self.price_currency})"

class LandPlot(BaseProperty):
    """ Модель для земельных участков """
    is_agricultural = models.BooleanField(default=False)
    has_communications = models.BooleanField(default=False)

    def __str__(self):
        return f"Земельный участок – {self.address} ({self.price_value} {self.price_currency})"

