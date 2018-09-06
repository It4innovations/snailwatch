import requests
from eve import ID_FIELD
from flask import Response, abort, jsonify, request

from .auth import check_password, generate_token, hash_password, requires_auth
from .db.loginsession import LoginSessionRepo
from .db.measurement import MeasurementRepo
from .db.project import ProjectRepo
from .db.uploadtoken import UploadTokenRepo
from .db.user import UserRepo


def api_error(code, message=""):
    resp = jsonify({"message": message})
    resp.status_code = code
    return abort(resp)


def bad_credentials():
    return api_error(403, "Wrong username or password")


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
                    "id": str(user[ID_FIELD]),
                    "token": token
                })
            else:
                bad_credentials()
        else:
            api_error(400, "Username or password missing")

    @app.route('/change-password', methods=['POST'])
    @requires_auth
    def change_password():
        data = request.get_json()
        old_password = data.get('oldPassword', None)
        new_password = data.get('newPassword', None)

        if old_password and new_password:
            user_repo = UserRepo(app)
            user = user_repo.get_user_from_request(request)
            if not user:
                bad_credentials()

            if not check_password(user, old_password):
                bad_credentials()

            if len(new_password) < 8:
                api_error(400, "Password is too short")

            user_repo.update_user_password(user, hash_password(new_password))
            return jsonify()
        else:
            api_error(400, "Password missing")

    @app.route('/revoke-upload-token', methods=['POST'])
    @requires_auth
    def revoke_upload_token():
        data = request.get_json()
        project_id = data.get('project', None)

        if project_id:
            user_repo = UserRepo(app)
            user = user_repo.get_user_from_request(request)
            if not user:
                api_error(404, "User not found")

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
        else:
            api_error(400, "Project id missing")

    @app.route('/get-upload-token/<project_id>', methods=['GET'])
    @requires_auth
    def get_upload_token(project_id):
        if project_id:
            user_repo = UserRepo(app)
            user = user_repo.get_user_from_request(request)
            if not user:
                api_error(404, "User not found")

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

    @app.route('/clear-measurements', methods=['POST'])
    @requires_auth
    def clear_measurements():
        user_repo = UserRepo(app)
        user = user_repo.get_user_from_request(request)
        if not user:
            api_error(404, "User not found")

        measurement_repo = MeasurementRepo(app)
        measurement_repo.clear_measurements_for_user(user)

        return jsonify()
