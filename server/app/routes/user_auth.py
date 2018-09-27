from eve import ID_FIELD
from flask import jsonify, request

from ..auth import check_password, hash_password, requires_auth
from ..db.loginsession import LoginSessionRepo
from ..db.user import UserRepo
from ..errors import api_error, bad_credentials
from ..snailwatch import app


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
