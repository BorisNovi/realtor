from django.db import models

# Модель листинга недвижимости
class Listing(models.Model):
    # Колонки в таблице листингов
    name = models.CharField(max_length=100)

    class Meta:
        db_table = 'listings'  # Явное указание имени таблицы в базе данных
    
    # Человекочитаемое представление объекта
    def __str__(self):
        return self.name