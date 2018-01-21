from eve import Eve, ID_FIELD
from eve_swagger import swagger
from flask import request, abort

from auth import TokenAuthenticator, check_password, create_session, \
    find_user_by_username, init_auth
from callbacks import set_app_callbacks

app = Eve(auth=TokenAuthenticator)
app.register_blueprint(swagger)

with app.app_context():
    set_app_callbacks(app)
    init_auth(app)


@app.route("/login", methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')
    if username and password:
        user = find_user_by_username(username)
        if not user:
            abort(403)

        if check_password(user, password):
            token = create_session(user[ID_FIELD])
            return token
        else:
            abort(403)
    else:
        abort(400)


if __name__ == '__main__':
    app.run()
