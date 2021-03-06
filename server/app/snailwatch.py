from eve import Eve
from flask_cors import CORS

from .auth import TokenAuthenticator
from .configuration import get_server_port
from .db.database import init_database
from .hooks import init_hooks

app = Eve(auth=TokenAuthenticator)
CORS(app)

with app.app_context():
    init_database(app)
    init_hooks(app)


def start():
    app.run(threaded=True, host='0.0.0.0', port=get_server_port())
