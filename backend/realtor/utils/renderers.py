from rest_framework.renderers import JSONRenderer
import inflection

class CamelCaseJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        camelized_data = self.camelize_keys(data)
        return super().render(camelized_data, accepted_media_type, renderer_context)

    def camelize_keys(self, obj):
        if isinstance(obj, dict):
            return {inflection.camelize(k, False): self.camelize_keys(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self.camelize_keys(item) for item in obj]
        return obj
