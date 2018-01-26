from eve import Eve, ID_FIELD
from eve_swagger import swagger
from flask import request, abort
from flask_cors import CORS

from auth import TokenAuthenticator, check_password, create_session, \
    find_user_by_username, init_auth
from callbacks import set_app_callbacks
from routes import setup_routes

app = Eve(auth=TokenAuthenticator)
app.register_blueprint(swagger)
CORS(app)

with app.app_context():
    set_app_callbacks(app)
    init_auth(app)


setup_routes(app)


if __name__ == '__main__':
    app.run(threaded=True)
