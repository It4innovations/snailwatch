from eve import ID_FIELD
from flask import request, abort, jsonify

from .db.loginsession import LoginSessionRepo
from .db.user import UserRepo
from .auth import check_password


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

            user_repo.update_user_password(user, new_password)
            return jsonify()
        else:
            abort(400)
