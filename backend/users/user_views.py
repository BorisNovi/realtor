from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import APIView, api_view
from django.contrib.auth import get_user_model
from catalog.catalog_models import Land, Property, Room, Flat, Office, House
from .user_serializers import ProfileSerializer, ChangePasswordSerializer
from users.import_csv import import_properties_csv
from users.export_csv import export_properties_csv

User = get_user_model()

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer    
    authentication_classes = [JWTAuthentication]  

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    authentication_classes = [JWTAuthentication]  

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        user = request.user

        if not user.is_authenticated:
            return Response({"USER_DOES_NOT_AUTHORIZED"}, status=401)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"INVALID_OLD_PASSWORD"}, status=400)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"PASSWORD_CHANGED_SUCCESSFULLY"}, status=200)

class DeleteProfileView(generics.DestroyAPIView):
    authentication_classes = [JWTAuthentication]  
    http_method_names = ["post", "delete"]

    def post(self, request, *args, **kwargs):
        return self.destroy(request, *args, **kwargs)

    def get_object(self):
        return self.request.user
    
    def destroy(self, request, *args, **kwargs):
        password = request.data.get("password")
        if not password or not request.user.check_password(password):
            return Response({"detail": "Invalid password"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user

        # сначала все дочерние подтипы
        Flat.objects.filter(user=user).delete()
        Land.objects.filter(user=user).delete()
        Room.objects.filter(user=user).delete()
        House.objects.filter(user=user).delete()
        Office.objects.filter(user=user).delete()
        
        # потом родитель
        Property.objects.filter(user=user).delete()

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# === Экспорт и импорт CSV ===

@api_view(["GET"])
def export_csv_view(request):
    return export_properties_csv(request.user)


class ImportPropertiesCSVView(APIView):
    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "CSV file required"}, status=400)

        try:
            result = import_properties_csv(file, request.user)

        except ValueError as e:
            return Response({"error": str(e)}, status=400)

        response_data = {"created": result["created"]}

        if result["errors"]:
            response_data["invalid_rows"] = [e["line"] for e in result["errors"]]

        status_code = 207 if result["errors"] else 200
        return Response(response_data, status=status_code)
    

# новый формат:
# class ImportPropertiesCSVView(APIView):
#     def post(self, request):
#         file = request.FILES.get("file")
#         if not file:
#             return Response({"error": "CSV file required"}, status=400)

#         try:
#             result = import_properties_csv(file, request.user)

#         except ValueError as e:
#             # Критические ошибки файла целиком (нет обязательных колонок и т.п.)
#             return Response({"error": str(e)}, status=400)

#         response_data = {
#             "created": result["created"],
#             "errors": result["errors"],  # всегда включаем, даже если пустой список
#         }

#         status_code = 207 if result["errors"] else 200
#         return Response(response_data, status=status_code)


# Для импорта:
# Убери ValidationError из импортов, используй только ValueError везде
# и формируй понятную структуру ошибки

# for line_number, row in enumerate(reader, start=2):
#     ...
#     try:
#         obj, contact = _build_property(row, user, contacts_cache)
#         valid_objects.append(obj)
#     except Exception as e:
#         errors.append({
#             "line": line_number,
#             "error_type": type(e).__name__,
#             "error": str(e),
#         })


# def _validate_address(row):
#     country = get_row_value(row, "address_country")
#     if country:
#         if not ISO_ALPHA2_RE.match(str(country).strip().upper()):
#             raise ValueError(
#                 f"Invalid country code '{country}'. "
#                 f"Use ISO Alpha-2 format (e.g. 'US', 'GE', 'DE')."
#             )

#     missing = [
#         HEADERS[field]["csv"]
#         for field in HEADERS
#         if field.startswith("address_") and HEADERS[field].get("required") and not get_row_value(row, field)
#     ]
#     if missing:
#         raise ValueError(f"Missing required address fields: {', '.join(missing)}")