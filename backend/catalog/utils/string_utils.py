import re

def snake_to_camel(snake_str):
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def dict_keys_to_camelcase(data):
    if isinstance(data, list):
        return [dict_keys_to_camelcase(i) for i in data]
    elif isinstance(data, dict):
        new_dict = {}
        for k, v in data.items():
            new_key = snake_to_camel(k)
            new_dict[new_key] = dict_keys_to_camelcase(v)
        return new_dict
    else:
        return data

# TODO: ОНО ВООБЩЕ ИСПОЛЬЗУЕТСЯ? ПРОВЕРЬ ПРИНТАМИ НА ДОСУГЕ. 