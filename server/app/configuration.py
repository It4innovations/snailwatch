import os


def get_option(name, default=None):
    return os.environ.get('SW_' + name, default)


def get_server_port():
    return int(get_option('PORT', 5000))


def get_admin_token():
    return get_option('ADMIN_TOKEN')


def get_mongo_host():
    return get_option('MONGO_HOST', 'localhost')


def get_mongo_port():
    return get_option('MONGO_PORT', 27017)


def get_mongo_db():
    return get_option('MONGO_DB', 'snailwatch')


def get_mongo_username():
    return get_option('MONGO_USERNAME')


def get_mongo_password():
    return get_option('MONGO_PASSWORD')
