from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),  # эндпоинт для регистрации
    #path("signin/", views.signin, name="signin"),
]
