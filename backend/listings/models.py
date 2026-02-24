from django.db import models
from users.models import User

class Listing(models.Model):
    name = models.CharField(max_length=100)                                     
    property_object_ids = models.JSONField(null=True, blank=True, default=list)  
    public_link = models.JSONField(max_length=200, null=True, blank=True)        
    company_name = models.CharField(max_length=100, null=True, blank=True)       
    company_logo = models.URLField(max_length=200, null=True, blank=True)        
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date_added = models.DateTimeField(auto_now_add=True)                        

    class Meta:
        db_table = 'listings'
    
    def __str__(self):
        return self.name
