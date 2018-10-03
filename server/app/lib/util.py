import operator
from functools import reduce


def get_dict_keys(item):
    def get_keys(obj, prefix, keys):
        for key in obj.keys():
            inner_key = key if prefix == '' else "{}.{}".format(prefix,
                                                                key)
            if isinstance(obj[key], dict):
                get_keys(obj[key], inner_key, keys)
            else:
                keys.append(inner_key)

    keys = []
    get_keys(item, '', keys)
    return keys


def group_by(iterable, key):
    group = {}
    for i in iterable:
        group.setdefault(key(i), []).append(i)
    return group


def get_value(obj, path, transform=lambda x: x):
    try:
        return transform(reduce(operator.getitem, path.split('.'), obj))
    except (KeyError, ValueError):
        return None


def clean_key(key):
    prefixes = ("environment.", "result.")
    for prefix in prefixes:
        if key.startswith(prefix):
            key = key[len(prefix):]

    suffixes = (".value", ".type")
    for suffix in suffixes:
        if key.endswith(suffix):
            key = key[:-len(suffix)]
    return key
