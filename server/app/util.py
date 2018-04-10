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
