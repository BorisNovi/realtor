from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView #For SignIn
 
from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),  # эндпоинт для регистрации
    path('api/signin/', views.SigninView.as_view(), name='signin'), # эндпоинт для входа

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
