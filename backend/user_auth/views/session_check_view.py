from rest_framework.decorators import api_view
from rest_framework.response import Response
from countries.models import Country

@api_view(['POST'])
def check_session(request):
    user = request.user
    
    country = Country.objects.filter(code=user.country).first()
    country_data = {
        "id": country.id,
        "name": country.code,
        "position": [country.capital_lng, country.capital_lat],
    } if country else None

    return Response({
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "country": country_data,
            "currency": user.currency,
            "company_name": user.company_name,
            "company_logo": user.company_logo,
            "marketing_consent1": user.marketing_consent1,
            "marketing_consent2": user.marketing_consent2,
            "role": user.role,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "banned_at": user.banned_at.isoformat() if user.banned_at else None,
            "last_logout_at": user.last_logout_at.isoformat() if user.last_logout_at else None,
            "date_added": user.date_added.isoformat(),
        }
    })
