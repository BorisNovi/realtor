# Эту команду можно использовать в "python manage.py shell" чтобы загрузить в БД список стран. 
# Пока что тут только 28.

from countries.models import Country

Country.objects.bulk_create([
    Country(code="af", name="Afghanistan", capital_lat=34.5553, capital_lng=69.2075),
    Country(code="al", name="Albania", capital_lat=41.3275, capital_lng=19.8187),
    Country(code="dz", name="Algeria", capital_lat=36.7538, capital_lng=3.0588),
    Country(code="ad", name="Andorra", capital_lat=42.5063, capital_lng=1.5218),
    Country(code="ao", name="Angola", capital_lat= -8.8390, capital_lng=13.2894),
    Country(code="ag", name="Antigua and Barbuda", capital_lat=17.1274, capital_lng=-61.8468),
    Country(code="ar", name="Argentina", capital_lat=-34.6037, capital_lng=-58.3816),
    Country(code="am", name="Armenia", capital_lat=40.1792, capital_lng=44.4991),
    Country(code="au", name="Australia", capital_lat=-35.2809, capital_lng=149.1300),
    Country(code="at", name="Austria", capital_lat=48.2082, capital_lng=16.3738),
    Country(code="az", name="Azerbaijan", capital_lat=40.4093, capital_lng=49.8671),
    Country(code="bs", name="Bahamas", capital_lat=25.0443, capital_lng=-77.3504),
    Country(code="bh", name="Bahrain", capital_lat=26.2235, capital_lng=50.5876),
    Country(code="bd", name="Bangladesh", capital_lat=23.8103, capital_lng=90.4125),
    Country(code="bb", name="Barbados", capital_lat=13.1132, capital_lng=-59.5988),
    Country(code="by", name="Belarus", capital_lat=53.9006, capital_lng=27.5590),
    Country(code="be", name="Belgium", capital_lat=50.8503, capital_lng=4.3517),
    Country(code="bz", name="Belize", capital_lat=17.5046, capital_lng=-88.1962),
    Country(code="bj", name="Benin", capital_lat=6.4969, capital_lng=2.6289),
    Country(code="bt", name="Bhutan", capital_lat=27.4728, capital_lng=89.6390),
    Country(code="bo", name="Bolivia", capital_lat=-16.4897, capital_lng=-68.1193),
    Country(code="ba", name="Bosnia and Herzegovina", capital_lat=43.8563, capital_lng=18.4131),
    Country(code="bw", name="Botswana", capital_lat=-24.6282, capital_lng=25.9231),
    Country(code="br", name="Brazil", capital_lat=-15.8267, capital_lng=-47.9218),
    Country(code="bn", name="Brunei", capital_lat=4.9031, capital_lng=114.9398),
    Country(code="bg", name="Bulgaria", capital_lat=42.6977, capital_lng=23.3219),
    Country(code="bf", name="Burkina Faso", capital_lat=12.3714, capital_lng=-1.5197),
    Country(code="bi", name="Burundi", capital_lat=-3.3614, capital_lng=29.3599),
    
])