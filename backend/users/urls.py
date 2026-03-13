from django.urls import path
from .user_views import ImportPropertiesCSVView, ProfileView, ChangePasswordView, DeleteProfileView, export_csv_view

urlpatterns = [
    path('', ProfileView.as_view(), name='profile'),
    path('/change-password', ChangePasswordView.as_view(), name='change-password'),
    path('/delete', DeleteProfileView.as_view(), name='delete-profile'),
    path('/export', export_csv_view, name='export-csv'),
    path('/import', ImportPropertiesCSVView.as_view(), name='import-csv'),
    # path('/object-import-confirm', ImportPropertiesCSVView.as_view(), name='import-csv-confirmation'),
]

# проверено, все работает. слэши в начале URLов нужны!