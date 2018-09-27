from flask import jsonify, abort


def api_error(code, message=""):
    resp = jsonify({"message": message})
    resp.status_code = code
    return abort(resp)


def bad_credentials():
    return api_error(403, "Wrong username or password")


def get_json_key(data, key):
    if not isinstance(data, dict):
        return api_error(400, "You have to send a dictionary of parameters")

    value = data.get(key, None)
    if value is None:
        return api_error(400, "Key {} is missing".format(key))
    return value
