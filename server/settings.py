from auth import AdminAuthenticator

# metadata
SWAGGER_INFO = {
    'title': 'Snailwatch',
    'version': '0.1.0',
    'description': 'REST API for Snailwatch',
    'contact': {
        'name': 'Jakub Beránek',
        'email': 'jakub.beranek.st@vsb.cz'
    },
    'license': {
        'name': 'BSD'
    },
    'schemes': ['http', 'https']
}

# database
MONGO_HOST = 'localhost'
MONGO_PORT = 27017
# MONGO_USERNAME = 'snailwatch'
# MONGO_PASSWORD = 'snailwatch'
MONGO_DBNAME = 'snailwatch'

# permissions
AUTH_FIELD = 'owner'
X_DOMAINS = '*'
X_HEADERS = ['Authorization', 'Content-Type']
ADMIN_AUTH_TOKEN = 'a67ba93bc150ab9f38e385feb038bf52'

# settings
HATEOAS = False
PAGINATION = False
XML = False

# schemas
dict_key_schema = {
    'type': 'string',
    'regex': '[a-zA-Z_/-]+'
}

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
    'benchmark': {
        'type': 'string',
        'required': True,
        'empty': False
    },
    'environment': {
        'type': 'dict',
        'propertyschema': dict_key_schema,
        'valueschema': {
            'type': 'string'
        }
    },
    'measurement': {
        'type': 'dict',
        'required': True,
        'propertyschema': dict_key_schema,
        'valueschema': {
            'type': 'dict',
            'schema': {
                'type': {
                    'type': 'string',
                    'required': True,
                    'allowed': ['time', 'size', 'integer', 'string']
                },
                'value': {
                    'oneof': [{
                        'type': 'string',
                        'empty': False
                        }, {
                        'type': 'number'
                    }],
                    'required': True
                }
            }
        }
    }
}

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
    }
}
