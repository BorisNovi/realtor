from rest_framework import serializers
from catalog.models import LandPlot

class LandPlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandPlot
        fields = '__all__'
