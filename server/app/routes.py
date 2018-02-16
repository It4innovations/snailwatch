from eve import ID_FIELD
from flask import request, abort, jsonify

from .auth import find_user_by_username, check_password, create_session


def setup_routes(app):
    @app.route("/login", methods=['POST'])
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
