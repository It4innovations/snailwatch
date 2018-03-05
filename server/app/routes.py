from eve import ID_FIELD
from flask import request, abort, jsonify

from .auth import find_user_by_username, check_password, create_session, \
    find_session, find_user_by_id, update_user_password


def setup_routes(app):
    @app.route('/login', methods=['POST'])
    def login():
        data = request.get_json()
        username = data.get('username', None)
        password = data.get('password', None)

        if username and password:
            user = find_user_by_username(username)
            if not user:
                abort(403)

            if check_password(user, password):
                token = create_session(user[ID_FIELD])
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
        token = request.headers['Authorization']

        if old_password and new_password and token:
            session = find_session(token)
            if not session:
                abort(403)

            user = find_user_by_id(session['user_id'])
            if not user:
                abort(403)

            if not check_password(user, old_password):
                abort(403)

            if len(new_password) < 8:
                abort(400)

            update_user_password(user, new_password)
            return jsonify()
        else:
            abort(400)
