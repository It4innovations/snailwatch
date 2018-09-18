from flask import jsonify, abort


def api_error(code, message=""):
    resp = jsonify({"message": message})
    resp.status_code = code
    return abort(resp)


def bad_credentials():
    return api_error(403, "Wrong username or password")
