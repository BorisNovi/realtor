# file/auth.py
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token

class BearerTokenAuthentication(TokenAuthentication):
    keyword = 'Bearer'
