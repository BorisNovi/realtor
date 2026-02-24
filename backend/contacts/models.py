from django.db import models
from users.models import User

class Contact(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    additional_phone = models.CharField(max_length=20, blank=True, null=True) 
    comment = models.TextField(blank=True, null=True)
    dateAdded = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.phone})"
