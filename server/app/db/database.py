import datetime
import uuid
import pymongo
from flask import request, current_app as app

from .uploadtoken import UploadTokenRepo
from .user import UserRepo
from ..auth import hash_password


def init_database(app):
    app.data.driver.db['sessions'].create_index('token', unique=True)
    app.data.driver.db['uploadtokens'].create_index(
        'token', unique=True)
    app.data.driver.db['uploadtokens'].create_index(
        'project', unique=True)
    app.data.driver.db['views'].create_index([
        ('project', pymongo.ASCENDING),
        ('name', pymongo.ASCENDING)
    ], unique=True)

    set_db_callbacks(app)


def before_insert_user(users):
    for user in users:
        user['password'] = hash_password(user['password'])
    return users


def before_insert_project(projects):
    user_repo = UserRepo(app)
    user = user_repo.get_user_from_request(request)

    for project in projects:
        project['writers'] = [user['_id']]


def after_insert_project(projects):
    user_repo = UserRepo(app)
    user = user_repo.get_user_from_request(request)
    session_repo = UploadTokenRepo(app)

    for project in projects:
        session_repo.create_token(project, user, uuid.uuid4().hex)


def before_insert_measurement(measurements):
    session_repo = UploadTokenRepo(app)
    session = session_repo.get_token_from_request(request)

    project_id = session['project']

    info = {
        'ip': request.remote_addr
    }

    for measurement in measurements:
        measurement['info'] = info
        measurement['project'] = project_id
        if 'timestamp' not in measurement:
            measurement['timestamp'] = datetime.datetime.utcnow()


def set_db_callbacks(app):
    app.on_insert_users += before_insert_user
    app.on_insert_projects += before_insert_project
    app.on_inserted_projects += after_insert_project
    app.on_insert_measurements += before_insert_measurement
