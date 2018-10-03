# the app. import has to be there, because Eve/Flask imports this file from
# a different location
from app.auth import UserAuthenticator, MeasurementAuthenticator
from app.configuration import get_mongo_db, get_mongo_host, get_mongo_port, \
    get_mongo_username, get_mongo_password, get_admin_token

# database
from eve import ID_FIELD

MONGO_HOST = get_mongo_host()
MONGO_PORT = get_mongo_port()

username = get_mongo_username()
if username:
    MONGO_USERNAME = username

password = get_mongo_password()
if password:
    MONGO_PASSWORD = password

MONGO_DBNAME = get_mongo_db()


# permissions
AUTH_FIELD = 'owner'
X_DOMAINS = '*'
X_HEADERS = ['Authorization', 'Content-Type']


token = get_admin_token()
if not token:
    raise Exception("You have to specify an admin token via "
                    "the environment variable ADMIN_TOKEN")

ADMIN_AUTH_TOKEN = token


# settings
HATEOAS = False
PAGINATION = False
RENDERERS = ['eve.render.JSONRenderer']
DATE_FORMAT = '%Y-%m-%dT%H:%M:%S'
IF_MATCH = False
MONGO_QUERY_BLACKLIST = []
BANDWIDTH_SAVER = False


# type helpers
def list_of(schema, required=True):
    return {
        'type': 'list',
        'required': required,
        'schema': schema
    }


def ref(collection, required=True):
    return {
        'type': 'objectid',
        'required': required,
        'nullable': not required,
        'data_relation': {
            'resource': collection,
            'field': ID_FIELD
        }
    }


def string(unique=False, empty=False, required=True):
    return {
        'type': 'string',
        'empty': empty,
        'required': required,
        'unique': unique
    }


def boolean(required=True):
    return {
        'type': 'boolean',
        'required': required
    }


filter_operators = ['==', '!=', '<', '<=', '>', '>=', 'contains', 'is defined']
filter_type = {
    'type': 'dict',
    'schema': {
        'path': {
            'type': 'string',
            'required': True
        },
        'operator': {
            'type': 'string',
            'required': True,
            'allowed': filter_operators
        },
        'value': {
            'type': 'string',
            'required': True
        }
    }
}
user_ref = ref('users')
identifier_regex = '[a-zA-Z_/-][a-zA-Z0-9_/-]*'


# schemas
user_schema = {
    'username': string(unique=True),
    'password': string(),
    'email': string(required=False, empty=True)
}
project_schema = {
    'name': {
        'type': 'string',
        'empty': False,
        'required': True,
        'unique_to_user': True
    },
    'writers': list_of(user_ref, required=False),
    'measurementKeys': list_of({
        'type': 'string'
    }, required=False),
    'repository': string(empty=True, required=False),
    'commitKey': string(empty=True, required=False)
}
measurement_schema = {
    'project': ref('projects', False),
    'benchmark': string(),
    'timestamp': {
        'type': 'datetime',
        'required': False
    },
    'environment': {
        'type': 'dict',
        'keyschema': {
            'type': 'string',
            'regex': identifier_regex
        },
        'valueschema': {
            'type': 'string'
        }
    },
    'result': {
        'type': 'dict',
        'required': True,
        'keyschema': {
            'type': 'string',
            'regex': identifier_regex
        },
        'valueschema': {
            'type': 'dict',
            'schema': {
                'type': {
                    'type': 'string',
                    'required': True,
                    'allowed': ['time', 'size', 'integer', 'string']
                },
                'value': {
                    'type': ['string', 'number'],
                    'required': True
                }
            }
        }
    }
}
view_schema = {
    'project': ref('projects'),
    'name': string(),
    'filters': list_of(filter_type),
    'yAxes': list_of(string()),
    'watches': list_of({
        'type': 'dict',
        'schema': {
            'id': string(),
            'groupBy': string(empty=True)
        }
    })
}


# endpoints
DOMAIN = {
    'users': {
        'schema': user_schema,
        'resource_methods': ['POST'],
        'item_methods': ['GET', 'PATCH'],
        'auth_field': None,
        'authentication': UserAuthenticator,
        'datasource': {
            'projection': {
                'username': 1,
                'email': 1
            }
        }
    },
    'projects': {
        'schema': project_schema,
        'resource_methods': ['GET', 'POST'],
        'item_methods': ['GET', 'PATCH']
    },
    'measurements': {
        'schema': measurement_schema,
        'resource_methods': ['GET', 'POST'],
        'item_methods': ['GET', 'DELETE'],
        'authentication': MeasurementAuthenticator
    },
    'views': {
        'schema': view_schema,
        'resource_methods': ['GET', 'POST'],
        'item_methods': ['GET', 'PATCH', 'DELETE']
    }
}
