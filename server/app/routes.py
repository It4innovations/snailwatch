import uuid

from eve import ID_FIELD
from flask import request, abort, jsonify

from app.db.project import ProjectRepo
from .auth import check_password, hash_password
from .db.loginsession import LoginSessionRepo
from .db.uploadtoken import UploadTokenRepo
from .db.user import UserRepo


def setup_routes(app):
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
                abort(403)

            if check_password(user, password):
                token = login_repo.create_session(user[ID_FIELD])['token']
                return jsonify(token)
            else:
                abort(403)
        else:
            abort(400)

    @app.route('/change-password', methods=['POST'])
    def change_password():
        data = request.get_json()
        old_password = data.get('oldPassword', None)
        new_password = data.get('newPassword', None)
        token = request.headers.get('Authorization', None)

        if old_password and new_password and token:
            user_repo = UserRepo(app)
            user = user_repo.get_user_from_request(request)
            if not user:
                abort(403)

            if not check_password(user, old_password):
                abort(403)

            if len(new_password) < 8:
                abort(400)

            user_repo.update_user_password(user, hash_password(new_password))
            return jsonify()
        else:
            abort(400)

    @app.route('/revoke-upload-token', methods=['POST'])
    def revoke_upload_token():
        data = request.get_json()
        project_id = data.get('project', None)
        token = request.headers.get('Authorization', None)

        if project_id and token:
            user_repo = UserRepo(app)
            user = user_repo.get_user_from_request(request)
            if not user:
                abort(403)

            project_repo = ProjectRepo(app)
            project = project_repo.find_project_by_id(project_id)
            if not project:
                abort(404)

            token_repo = UploadTokenRepo(app)
            old_token = token_repo.find_token_by_project(project_id)

            if user['_id'] not in project['writers']:
                abort(403)

            new_token = uuid.uuid4().hex
            token_repo.update_token(old_token, new_token)

            return jsonify(new_token)
        else:
            abort(400)

    @app.route('/get-upload-token/<project_id>', methods=['GET'])
    def get_upload_token(project_id):
        token = request.headers.get('Authorization', None)

        if project_id and token:
            user_repo = UserRepo(app)
            user = user_repo.get_user_from_request(request)
            if not user:
                abort(403)

            project_repo = ProjectRepo(app)
            project = project_repo.find_project_by_id(project_id)
            if not project:
                abort(404)

            token_repo = UploadTokenRepo(app)
            token = token_repo.find_token_by_project(project_id)

            if user['_id'] not in project['writers']:
                abort(403)

            return jsonify(token["token"])
        else:
            abort(400)
