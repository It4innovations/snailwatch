import uuid

from app.auth import AdminAuthenticator
from app.configuration import get_mongo_db, get_mongo_host, get_mongo_port, \
    get_mongo_username, get_mongo_password, get_admin_token

# database
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
    token = str(uuid.uuid4().hex)
    print("Generated admin token: {}".format(token))

ADMIN_AUTH_TOKEN = token


# settings
HATEOAS = False
PAGINATION = True
PAGINATION_LIMIT = 500
PAGINATION_DEFAULT = 50
RENDERERS = ['eve.render.JSONRenderer']
DATE_FORMAT = '%Y-%m-%dT%H:%M:%S'
ENFORCE_IF_MATCH = False


# schemas
user_schema = {
    'username': {
        'type': 'string',
        'required': True,
        'empty': False,
        'unique': True
    },
    'password': {
        'type': 'string',
        'empty': False,
        'required': True
    }
}
project_schema = {
    'name': {
        'type': 'string',
        'empty': False,
        'required': True,
        'unique_to_user': True
    }
}
measurement_schema = {
    'project': {
        'type': 'objectid',
        'required': True,
        'data_relation': {
            'resource': 'projects',
            'field': '_id'
        }
    },
    'benchmark': {
        'type': 'string',
        'required': True,
        'empty': False
    },
    'timestamp': {
        'type': 'datetime',
        'required': False
    },
    'environment': {
        'type': 'dict',
        'keyschema': {
            'type': 'string',
            'regex': '[a-zA-Z_/-]+'
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
            'regex': '[a-zA-Z_/-]+'
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
                    'type': 'string',
                    'required': True
                }
            }
        }
    }
}
view_schema = {
    'name': {
        'type': 'string',
        'empty': False,
        'required': True,
        'unique_to_user': True
    },
    'project': {
        'type': 'objectid',
        'required': True,
        'data_relation': {
            'resource': 'projects',
            'field': '_id'
        }
    },
    'filters': {
        'type': 'list',
        'required': True,
        'schema': {
            'type': 'dict',
            'schema': {
                'path': {
                    'type': 'string',
                    'required': True
                },
                'operator': {
                    'type': 'string',
                    'required': True,
                    'allowed': ['==', '!=', '<', '<=', '>', '>=']
                },
                'value': {
                    'type': 'string',
                    'required': True
                }
            }
        }
    },
    'xAxis': {
        'type': 'string',
        'required': True
    },
    'yAxis': {
        'type': 'string',
        'required': True
    }
}

# endpoints
DOMAIN = {
    'users': {
        'schema': user_schema,
        'resource_methods': ['GET', 'POST'],
        'authentication': AdminAuthenticator
    },
    'projects': {
        'schema': project_schema,
        'resource_methods': ['GET', 'POST']
    },
    'measurements': {
        'schema': measurement_schema,
        'resource_methods': ['GET', 'POST'],
        'item_methods': ['GET', 'DELETE']
    },
    'views': {
        'schema': view_schema,
        'resource_methods': ['GET', 'POST'],
        'item_methods': ['GET', 'PATCH', 'DELETE']
    }
}
