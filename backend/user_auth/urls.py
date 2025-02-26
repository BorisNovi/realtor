from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView #For SignIn
 
from django.urls import path
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),  # api/v1/auth/signup/
    path('signin/', views.SigninView.as_view(), name='signin'),  # api/v1/auth/signin/

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
