from eve import Eve
from eve_swagger import swagger
from flask_cors import CORS

from callbacks import set_app_callbacks
from auth import TokenAuthenticator
from database import init_database
from routes import setup_routes

app = Eve(auth=TokenAuthenticator)
app.register_blueprint(swagger)
CORS(app)

with app.app_context():
    set_app_callbacks(app)
    init_database(app)


setup_routes(app)


if __name__ == '__main__':
    app.run(threaded=True)
