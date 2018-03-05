import datetime
import pymongo
from flask import request

from app.auth import hash_password


def init_database(app):
    app.data.driver.db['sessions'].create_index('token', unique=True)
    app.data.driver.db['views'].create_index([
        ('project', pymongo.ASCENDING),
        ('name', pymongo.ASCENDING)
    ], unique=True)


def before_insert_user(users):
    for user in users:
        user['password'] = hash_password(user['password'])
    return users


def before_insert_measurement(measurements):
    info = {
        'ip': request.remote_addr
    }

    for measurement in measurements:
        measurement['info'] = info
        if 'timestamp' not in measurement:
            measurement['timestamp'] = datetime.datetime.utcnow()


def set_db_callbacks(app):
    app.on_insert_users += before_insert_user
    app.on_insert_measurements += before_insert_measurement
