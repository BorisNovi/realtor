# user_auth/urls.py
from django.urls import path
from user_auth import views
from .views.activation_view import PasswordResetActivateView
from .views.session_check_view import check_session
from .views.password_view import PasswordRecoveryView
from .views.refresh_view import RefreshTokenView
from .views.signin_view import SigninView
from .views.terminate_sessions import logout_all

urlpatterns = [
    path('/sign-up', views.signup, name='signup'),
    path('/sign-up-activate', views.signup_activate, name='sign-up-activate'),  
    path('/sign-in', views.SigninView.as_view(), name='signin'),  
    path('/recover', PasswordRecoveryView.as_view(), name='password-recover'),
    path('/recover-activate', PasswordResetActivateView.as_view(), name='password-reset-activate'),
    path('/refresh', RefreshTokenView.as_view(), name='refresh_token'),
    path('/sessions/check', check_session, name='check_session'),
    path('/logout-all', logout_all, name='logout_all'),

]

# проверено, все работает. слэши в начале URLов нужны!