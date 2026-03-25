from django.db import models

class Country(models.Model):
    code = models.CharField(max_length=2, unique=True)  # ISO alpha-2 (ru, ge)
    name = models.CharField(max_length=100)
    capital_lng = models.FloatField()
    capital_lat = models.FloatField()

    class Meta:
        ordering = ("code",)

    def __str__(self):
        return self.code