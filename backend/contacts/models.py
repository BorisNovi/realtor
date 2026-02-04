from django.db import models

class Contact(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, unique=True)
    additional_phone = models.CharField(max_length=20, blank=True, null=True)  # необязательное
    comment = models.TextField(blank=True, null=True)  # необязательное
    dateAdded = models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"{self.name} ({self.phone})"
