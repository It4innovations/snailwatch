import datetime

from eve import Eve
from flask import request
from auth import hash_password


def before_insert_user(users):
    for user in users:
        user["password"] = hash_password(user["password"])
    return users


def before_insert_measurement(measurements):
    info = {
        "ip": request.remote_addr
    }

    for measurement in measurements:
        measurement["info"] = info
        if measurement["timestamp"] == "":
            measurement["timestamp"] = datetime.datetime.utcnow()


def set_app_callbacks(app: Eve):
    app.on_insert_users += before_insert_user
    app.on_insert_measurements += before_insert_measurement
