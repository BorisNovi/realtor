from django.urls import path
from rest_framework.routers import DefaultRouter
from user_auth.views.terminate_sessions import LogoutAllView
from .views import (
    AuthViewSet,
    PasswordRecoveryView,
    PasswordResetActivateView,
    refresh_view,
    session_check_view
)

router = DefaultRouter()
router.register(r'', AuthViewSet, basename='auth')  

urlpatterns = [
    path('/sign-up', AuthViewSet.as_view({'post': 'sign_up',})),
    path('/sign-up-activate', AuthViewSet.as_view({'post': 'sign_up_activate',})),
    path('/sign-in', AuthViewSet.as_view({'post': 'sign_in',})),

    # восстановление пароля
    path('/recover', PasswordRecoveryView.as_view(), name='password_recover'),
    path('/recover-activate', PasswordResetActivateView.as_view(), name='password_reset_activate'),

    # refresh токена
    path('/refresh', refresh_view.RefreshTokenView.as_view(), name='token_refresh'),

    # проверка сессии
    path('/sessions/check', session_check_view.check_session, name='check_session'),
    path('/logout-all', LogoutAllView.as_view(), name='logout_all'),
]


# проверено, все работает. слэши в начале URLов нужны!