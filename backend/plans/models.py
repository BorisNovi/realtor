from django.db import models

class Plan(models.Model):
    code = models.CharField(unique=True)
    name = models.CharField(max_length=255)

    max_properties = models.PositiveIntegerField(default=0)
    max_agents = models.PositiveIntegerField(default=0)