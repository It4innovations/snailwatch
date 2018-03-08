import datetime
import uuid

import pymongo
from flask import request, current_app as app, abort

from app.db.uploadsession import UploadSessionRepo
from .user import UserRepo
from .project import ProjectRepo
from ..auth import hash_password


def init_database(app):
    app.data.driver.db['sessions'].create_index('token', unique=True)
    app.data.driver.db['uploadsessions'].create_index(
        'token', unique=True)
    app.data.driver.db['views'].create_index([
        ('project', pymongo.ASCENDING),
        ('name', pymongo.ASCENDING)
    ], unique=True)

    set_db_callbacks(app)


def before_insert_user(users):
    for user in users:
        user['password'] = hash_password(user['password'])
    return users


def before_insert_measurement(measurements):
    session_repo = UploadSessionRepo(app)
    session = session_repo.get_session_from_request(request)
    if not session:
        abort(403)

    project_id = session['project']

    info = {
        'ip': request.remote_addr
    }

    for measurement in measurements:
        measurement['info'] = info
        measurement['project'] = project_id
        if 'timestamp' not in measurement:
            measurement['timestamp'] = datetime.datetime.utcnow()


def before_insert_uploadsessions(sessions):
    user_repo = UserRepo(app)

    user = user_repo.get_user_from_request(request)
    project_repo = ProjectRepo(app)

    for session in sessions:
        project = project_repo.find_project_by_id(session['project'])
        if not project or project['owner'] != user['_id']:
            abort(403)

        session['token'] = uuid.uuid4().hex


def set_db_callbacks(app):
    app.on_insert_users += before_insert_user
    app.on_insert_measurements += before_insert_measurement
    app.on_insert_uploadsessions += before_insert_uploadsessions
