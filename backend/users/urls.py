from django.urls import path
from .user_views import ProfileView, ChangePasswordView, DeleteProfileView

urlpatterns = [
    path('', ProfileView.as_view(), name='profile'),
    path('/change-password', ChangePasswordView.as_view(), name='change-password'),
    path('/delete', DeleteProfileView.as_view(), name='delete-profile'),
]

# проверено, все работает. слэши в начале URLов нужны!