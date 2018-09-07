import datetime
from functools import reduce

from eve import ID_FIELD
from flask import current_app as app, request

from .auth import generate_token, hash_password
from .db.project import ProjectRepo
from .db.uploadtoken import UploadTokenRepo
from .db.user import UserRepo
from .db.view import ViewRepo
from .util import get_dict_keys


def add_upload_token_to_projects(projects):
    repo = UploadTokenRepo(app)
    for project in projects:
        project['uploadToken'] = repo.find_token_by_project(
            project[ID_FIELD])['token']


def before_insert_user(users):
    for user in users:
        user['password'] = hash_password(user['password'])
    return users


def before_insert_project(projects):
    user_repo = UserRepo(app)
    user = user_repo.get_user_from_request(request)

    for project in projects:
        project['writers'] = [user['_id']]
        project['measurementKeys'] = []
        project['repository'] = ''
        project['commitKey'] = 'environment.commit'


def after_insert_project(projects):
    user_repo = UserRepo(app)
    user = user_repo.get_user_from_request(request)
    session_repo = UploadTokenRepo(app)

    for project in projects:
        session_repo.create_token(project, user, generate_token())


def after_fetch_project(project):
    add_upload_token_to_projects([project])


def after_fetch_projects(projects):
    add_upload_token_to_projects(projects['_items'])


def before_insert_measurement(measurements):
    session_repo = UploadTokenRepo(app)
    session = session_repo.get_token_from_request(request)

    project_id = session['project']
    project_repo = ProjectRepo(app)

    info = {
        'ip': request.remote_addr
    }

    benchmarks = {}
    keys = set()
    for measurement in measurements:
        measurement['info'] = info
        measurement['project'] = project_id
        if 'timestamp' not in measurement:
            measurement['timestamp'] = datetime.datetime.utcnow()

        keys.update(get_dict_keys({
            'benchmark': measurement['benchmark'],
            'timestamp': measurement['timestamp'],
            'environment': measurement['environment'],
            'result': measurement['result'],
        }))
        benchmarks.setdefault(measurement['benchmark'], []).append(measurement)

    project_repo.add_measurement_keys(project_id, list(keys))

    view_repo = ViewRepo(app)
    for (benchmark, measurements) in benchmarks.items():
        views = list(view_repo.get_views_with_benchmark(benchmark))
        if not views and benchmark:
            y_axes = [set(m['result'].keys())
                      for m in measurements if m['result']]
            union = reduce(lambda a, b: a.union(b), y_axes, set())
            y_axes = reduce(lambda a, b: a.intersection(b), y_axes, union)
            y_axes = ['result.{}.value'.format(y) for y in y_axes]

            view_repo.create_internal(project_id, benchmark, [{
                'path': 'benchmark',
                'operator': '==',
                'value': benchmark
            }], y_axes)


def init_hooks(app):
    app.on_insert_users += before_insert_user
    app.on_insert_projects += before_insert_project
    app.on_inserted_projects += after_insert_project
    app.on_insert_measurements += before_insert_measurement
    app.on_fetched_item_projects += after_fetch_project
    app.on_fetched_resource_projects += after_fetch_projects
