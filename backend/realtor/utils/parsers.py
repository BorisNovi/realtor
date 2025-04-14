from rest_framework.parsers import JSONParser
import inflection

class CamelCaseJSONParser(JSONParser):
    def parse(self, stream, media_type=None, parser_context=None):
        data = super().parse(stream, media_type=media_type, parser_context=parser_context)
        return self.decamelize_keys(data)

    def decamelize_keys(self, obj):
        if isinstance(obj, dict):
            return {inflection.underscore(k): self.decamelize_keys(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [self.decamelize_keys(item) for item in obj]
        return obj
