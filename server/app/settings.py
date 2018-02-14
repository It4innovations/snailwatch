import json
import os
from app.auth import AdminAuthenticator

# import configuration
dir = os.path.dirname(__file__)
with open(os.path.join(dir, '../configuration.json'), 'r') as f:
    configuration = json.load(f)


# database
MONGO_HOST = configuration["mongoHost"]
MONGO_PORT = configuration["mongoPort"]

if "mongoUser" in configuration:
    MONGO_USERNAME = configuration["mongoUser"]

if "mongoPassword" in configuration:
    MONGO_PASSWORD = configuration["mongoPassword"]

MONGO_DBNAME = configuration["mongoDB"]


# permissions
AUTH_FIELD = 'owner'
X_DOMAINS = '*'
X_HEADERS = ['Authorization', 'Content-Type']
ADMIN_AUTH_TOKEN = configuration['adminAuthToken']


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
        'resource_methods': ['GET', 'POST']
    },
    'views': {
        'schema': view_schema,
        'resource_methods': ['GET', 'POST'],
        'item_methods': ['GET', 'PATCH', 'DELETE']
    }
}
