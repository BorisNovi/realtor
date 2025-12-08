from django.db.models.signals import post_save
from django.dispatch import receiver
from listings.models import Listing
from catalog.catalog_models import Flat # House, Land и другие дочерние модели

# Функция для очистки ссылок на удалённые объекты недвижимости из листингов
def cleanup_from_listings(deleted_id):
    """Если какой-то объект недвижимости был удалён из БД,
    то функция убирает его ID из всех листингов, где он присутствует."""

    listings = Listing.objects.filter(property_object_ids__contains=[deleted_id])
    for listing in listings:
        ids = listing.property_object_ids or []
        if deleted_id in ids:
            ids.remove(deleted_id)
            listing.property_object_ids = ids
            listing.save()


@receiver(post_save, sender=Flat)
def soft_delete_flat(sender, instance, **kwargs):
    if instance.is_deleted:
        cleanup_from_listings(instance.id)

# TODO: не забудь про это, когда добавишь другие модели недвижимости
# @receiver(post_save, sender=House)
# def soft_delete_house(sender, instance, **kwargs):
#     if instance.is_deleted:
#         cleanup_from_listings(instance.id)


# @receiver(post_save, sender=Land)
# def soft_delete_land(sender, instance, **kwargs):
#     if instance.is_deleted:
#         cleanup_from_listings(instance.id)

