from eve import Eve
from flask_cors import CORS

from app.callbacks import set_app_callbacks
from app.auth import TokenAuthenticator
from app.database import init_database
from app.routes import setup_routes


def start():
    app = Eve(auth=TokenAuthenticator)
    CORS(app)

    with app.app_context():
        set_app_callbacks(app)
        init_database(app)

    setup_routes(app)
    app.run(threaded=True)
