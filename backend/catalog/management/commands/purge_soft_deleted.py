from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from catalog.catalog_models import Flat

class Command(BaseCommand):
    help = "Удаляет объекты, мягко удалённые более X времени назад"

    def handle(self, *args, **kwargs):
        threshold = timezone.now() - timedelta(days=7) # Заменить на нужное время, например, timedelta(days=30) для 30 дней
        total = 0

        for model in [Flat]:
            old = model.objects.filter(is_deleted=True, deleted_at__lt=threshold)
            count = old.count()
            if count:
                old.delete()
                total += count

        self.stdout.write(self.style.SUCCESS(f"✅ Permanently deleted {total} objects."))
