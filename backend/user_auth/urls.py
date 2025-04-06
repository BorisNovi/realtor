from django.urls import path
from user_auth import views
from .views.activation import PasswordResetActivateView
from .views.auth import LogoutView
from .views.auth import check_session
from .views.password import PasswordRecoveryView
from .views.refresh import RefreshTokenView


urlpatterns = [
    path('sign-up', views.signup, name='signup'),
    path('sign-up-activate', views.signup_activate, name='sign-up-activate'),  
    path('sign-in', views.SigninView.as_view(), name='signin'),  
    path('recover', PasswordRecoveryView.as_view(), name='password-recover'),
    path('recover-activate', PasswordResetActivateView.as_view(), name='password-reset-activate'),
    path('refresh', RefreshTokenView.as_view(), name='refresh_token'),
    path('sessions/check', check_session, name='check_session'),
]