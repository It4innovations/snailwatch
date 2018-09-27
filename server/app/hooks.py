import datetime
from functools import reduce

from eve import ID_FIELD
from flask import current_app as app, request

from .auth import generate_token, get_user_from_request, hash_password
from .db.project import ProjectRepo
from .db.uploadtoken import UploadTokenRepo
from .db.user import UserRepo
from .db.view import ViewRepo
from .lib.regression.notifications import notify_regressions
from .lib.regression.regressions import check_regressions
from .lib.util import get_dict_keys
from .settings import AUTH_FIELD


def check_and_notify_regressions(project, user):
    regressions = check_regressions(user, project)
    if regressions:
        notify_regressions(user, project, regressions)


def add_upload_token_to_projects(projects):
    repo = UploadTokenRepo(app)
    for project in projects:
        project['uploadToken'] = repo.find_token_by_project(
            project[ID_FIELD])['token']


def before_insert_users(users):
    for user in users:
        user['password'] = hash_password(user['password'])
        if 'email' not in user:
            user['email'] = ''
    return users


def before_insert_projects(projects):
    user = get_user_from_request(request)

    for project in projects:
        project['writers'] = [user['_id']]
        project['measurementKeys'] = []
        if 'repository' not in project:
            project['repository'] = ''
        project['commitKey'] = 'environment.commit'


def after_insert_projects(projects):
    user = get_user_from_request(request)
    session_repo = UploadTokenRepo(app)

    for project in projects:
        project['uploadToken'] = generate_token()
        session_repo.create_token(project, user, project['uploadToken'])


def after_fetch_project(project):
    add_upload_token_to_projects([project])


def after_fetch_projects(projects):
    add_upload_token_to_projects(projects['_items'])


def before_insert_measurements(measurements):
    session_repo = UploadTokenRepo(app)
    session = session_repo.get_token_from_request(request)

    project_id = session['project']
    project_repo = ProjectRepo(app)

    info = {
        'ip': request.remote_addr
    }

    # Gather measurement keys
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

    # Create default views
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


def after_insert_measurements(measurements):
    session_repo = UploadTokenRepo(app)
    session = session_repo.get_token_from_request(request)
    user = UserRepo(app).find_user_by_id(session[AUTH_FIELD])
    project = ProjectRepo(app).find_project_by_id(session['project'])
    check_and_notify_regressions(project, user)

    app.logger.info('{} measurement(s) inserted'.format(len(measurements)))


def after_fetch_measurements(measurements):
    for m in measurements['_items']:
        del m['_created']
        del m['_updated']
        del m['_etag']


def init_hooks(app):
    app.on_insert_users += before_insert_users
    app.on_insert_projects += before_insert_projects
    app.on_inserted_projects += after_insert_projects
    app.on_insert_measurements += before_insert_measurements
    app.on_inserted_measurements += after_insert_measurements
    app.on_fetched_item_projects += after_fetch_project
    app.on_fetched_resource_projects += after_fetch_projects
    app.on_fetched_resource_measurements += after_fetch_measurements
