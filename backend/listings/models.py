from django.db import models

# Модель листинга недвижимости
class Listing(models.Model):
    name = models.CharField(max_length=100)                                      # Название
    property_object_ids = models.JSONField(null=True, blank=True, default=list)  # Список ID объектов недвижимости
    public_link = models.JSONField(max_length=200, null=True, blank=True)        # Публичная ссылка на листинг
    company_name = models.CharField(max_length=100, null=True, blank=True)       # Название компании
    company_logo = models.URLField(max_length=200, null=True, blank=True)        # Логотип компании
    date_added = models.DateTimeField(auto_now_add=True)                         # Дата и время создания листинга

    class Meta:
        db_table = 'listings'  # Явное указание имени таблицы в базе данных
    
    # Человекочитаемое представление объекта
    def __str__(self):
        return self.name
