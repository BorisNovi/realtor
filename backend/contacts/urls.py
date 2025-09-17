from django.urls import path
from .views import ContactView

urlpatterns = [
    # path('', ContactView.as_view(), name='create_contact'), # Список и создание контакта
    # path('<int:pk>/', ContactView.as_view(), name='update_contact'), # Обновление конкретного контакта

# новые пути. Убрал С на конце. 
    path('list/', ContactView.as_view(), name='contact-list'),             # список контактов
    path('', ContactView.as_view(), name='contact-create'),                # создание контакта
    path('<int:pk>/', ContactView.as_view(), name='contact-detail'),       # получение, обновление, удаление конкретного контакта


]
