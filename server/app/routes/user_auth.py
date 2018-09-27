from eve import ID_FIELD
from flask import jsonify, request

from ..auth import check_password, hash_password, requires_auth
from ..db.loginsession import LoginSessionRepo
from ..db.user import UserRepo
from ..request import api_error, bad_credentials, get_json_key
from ..snailwatch import app


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = get_json_key(data, 'username')
    password = get_json_key(data, 'password')

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


@app.route('/change-password', methods=['POST'])
@requires_auth(with_user=True)
def change_password(user):
    data = request.get_json()
    old_password = get_json_key(data, 'oldPassword')
    new_password = get_json_key(data, 'newPassword')

    if not check_password(user, old_password):
        bad_credentials()

    if len(new_password) < 8:
        api_error(400, "Password is too short")

    UserRepo(app).update_user_password(
        user, hash_password(new_password)
    )
    return jsonify()
