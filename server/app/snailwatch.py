from eve import Eve
from flask_cors import CORS

from .auth import TokenAuthenticator
from .configuration import get_server_port
from .database import init_database, set_db_callbacks
from .routes import setup_routes


def start():
    app = Eve(auth=TokenAuthenticator)
    CORS(app)

    with app.app_context():
        init_database(app)
        set_db_callbacks(app)

    setup_routes(app)
    app.run(threaded=True, host='0.0.0.0', port=get_server_port())
