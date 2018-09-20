import datetime

import requests
from eve import ID_FIELD
from flask import Response, jsonify, request

from .auth import check_password, generate_token, get_session_for_token, \
    hash_password, requires_auth, set_auth_value
from .db.loginsession import LoginSessionRepo
from .db.measurement import MeasurementRepo
from .db.project import ProjectRepo
from .db.uploadtoken import UploadTokenRepo
from .db.user import UserRepo
from .db.view import ViewRepo
from .errors import api_error, bad_credentials
from .export import export_measurements
from .regression.notifications import notify_regressions
from .regression.regressions import MeasurementGroup, Regression


def setup_routes(app):
    @app.route('/schema', methods=['GET'])
    def schema():
        response = requests.get("https://app.swaggerhub.com/apiproxy/schema"
                                "/file/IT4I/Snailwatch/0.1/swagger.json")
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename=snailwatch.json'
        }

        return Response(response.content, response.status_code, headers)

    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username', None)
        password = data.get('password', None)

        if username and password:
            user_repo = UserRepo(app)
            login_repo = LoginSessionRepo(app)

            user = user_repo.find_user_by_username(username)
            if not user:
                bad_credentials()

            if check_password(user, password):
                token = login_repo.create_session(user[ID_FIELD])['token']
                return jsonify({
                    ID_FIELD: str(user[ID_FIELD]),
                    "username": user['username'],
                    "email": user['email'],
                    "token": token
                })
            else:
                bad_credentials()
        else:
            api_error(400, "Username or password missing")

    @app.route('/change-password', methods=['POST'])
    @requires_auth(with_user=True)
    def change_password(user):
        data = request.get_json()
        old_password = data.get('oldPassword', None)
        new_password = data.get('newPassword', None)

        if old_password and new_password:
            if not check_password(user, old_password):
                bad_credentials()

            if len(new_password) < 8:
                api_error(400, "Password is too short")

            UserRepo(app).update_user_password(
                user, hash_password(new_password)
            )
            return jsonify()
        else:
            api_error(400, "Password missing")

    @app.route('/projects/<project_id>/upload-token', methods=['POST'])
    @requires_auth(with_user=True)
    def revoke_upload_token(user, project_id):
        project_repo = ProjectRepo(app)
        project = project_repo.find_project_by_id(project_id)
        if not project:
            api_error(404, "Project not found")

        token_repo = UploadTokenRepo(app)
        old_token = token_repo.find_token_by_project(project_id)

        if user['_id'] not in project['writers']:
            api_error(403, "You can't modify this project")

        new_token = generate_token()
        token_repo.update_token(old_token, new_token)

        return jsonify(new_token)

    @app.route('/projects/<project_id>/upload-token', methods=['GET'])
    @requires_auth(with_user=True)
    def get_upload_token(user, project_id):
        if project_id:
            project_repo = ProjectRepo(app)
            project = project_repo.find_project_by_id(project_id)
            if not project:
                api_error(404, "Project not found")

            token_repo = UploadTokenRepo(app)
            token = token_repo.find_token_by_project(project_id)

            if user['_id'] not in project['writers']:
                api_error(403, "You can't read this project")

            return jsonify(token["token"])
        else:
            api_error(400, "Project id missing")

    @app.route('/projects/<project_id>/measurements', methods=['DELETE'])
    @requires_auth()
    def clear_measurements(project_id):
        project = ProjectRepo(app).find_project_by_id(project_id)
        if not project:
            api_error(404)

        MeasurementRepo(app).clear_measurements_for_project(project)

        return jsonify()

    @app.route('/projects/<project_id>/export-measurements', methods=['POST'])
    def export_measurements_route(project_id):
        data = request.form
        format = data.get('format', None)
        token = data.get('token', None)

        if token and format in ('json', 'csv'):
            session = get_session_for_token(token)
            if not session:
                api_error(403)

            set_auth_value(session['user_id'])
            user = UserRepo(app).find_user_by_id(session['user_id'])
            if not user:
                api_error(403)

            measurements = MeasurementRepo(app).get_measurements(user)
            project = ProjectRepo(app).find_project_by_id(project_id)
            if not project:
                api_error(404, "Project not found")

            mime = 'application/json' if format == 'json' else 'text/csv'
            headers = {
                'Content-Type': mime,
                'Content-Disposition':
                    'attachment; filename="measurements.{}"'.format(format)
            }

            return Response(
                export_measurements(project, measurements, format),
                headers=headers
            )
        else:
            api_error(400, "Bad request")

    @app.route('/send-email', methods=['POST'])
    @requires_auth(with_user=True)
    def send_email(user):
        project_repo = ProjectRepo(app)
        project = project_repo.find_project_by_id('5b4c7c7ce540cd0614a03d00')

        notify_regressions(user, project, [Regression(
            list(ViewRepo(app).get_views_for_user(user))[0],
            'environment.commit',
            MeasurementGroup('result.time.value', 100, [1, 2, 3], datetime.datetime.now()),
            MeasurementGroup('result.time.value', 128, [1, 2, 3, 4],
                             datetime.datetime.now())
        )])

        return jsonify()
