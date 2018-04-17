import datetime
import uuid
import pymongo
from flask import request, current_app as app

from app.db.loginsession import LoginSessionRepo
from app.db.project import ProjectRepo
from app.util import get_dict_keys
from .uploadtoken import UploadTokenRepo
from .user import UserRepo
from ..auth import hash_password


def init_database(app):
    LoginSessionRepo(app).create_indices()
    UploadTokenRepo(app).create_indices()

    app.data.driver.db['selections'].create_index([
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
        project['measurementkeys'] = []


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
    project_repo = ProjectRepo(app)

    info = {
        'ip': request.remote_addr
    }

    for measurement in measurements:
        measurement['info'] = info
        measurement['project'] = project_id
        if 'timestamp' not in measurement:
            measurement['timestamp'] = datetime.datetime.utcnow()

        keys = get_dict_keys({
            'benchmark': measurement['benchmark'],
            'timestamp': measurement['timestamp'],
            'environment': measurement['environment'],
            'result': measurement['result'],
        })
        project_repo.add_measurement_keys(project_id, keys)


def set_db_callbacks(app):
    app.on_insert_users += before_insert_user
    app.on_insert_projects += before_insert_project
    app.on_inserted_projects += after_insert_project
    app.on_insert_measurements += before_insert_measurement