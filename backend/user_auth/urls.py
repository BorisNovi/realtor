from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView #For SignIn
 
from django.urls import path
from . import views
from .views import LogoutView, ProtectedView

urlpatterns = [
    path('signup/', views.signup, name='signup'),  # api/v1/auth/signup/
    path('signin/', views.SigninView.as_view(), name='signin'),  # api/v1/auth/signin/
    path('logout/', LogoutView.as_view(), name='logout'),
    path('protected-endpoint/', ProtectedView.as_view(), name='protected-endpoint'),

]
