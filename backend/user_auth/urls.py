from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView 
 
from django.urls import path
from . import views
from .views import LogoutView, PasswordRecoveryView, PasswordResetActivateView, ProtectedView

urlpatterns = [
    path('sign-up/', views.signup, name='signup'),
    path('sign-up-activate/', views.signup_activate, name='sign-up-activate'),  
    
    path('sign-in/', views.SigninView.as_view(), name='signin'),  
    
    path('logout/', LogoutView.as_view(), name='logout'),
    path('protected-endpoint/', ProtectedView.as_view(), name='protected-endpoint'),
    
    path('recover/', PasswordRecoveryView.as_view(), name='password-recover'),
    path('recover-activate/', PasswordResetActivateView.as_view(), name='password-reset-activate'),
]