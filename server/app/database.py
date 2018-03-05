import pymongo


def init_database(app):
    app.data.driver.db['sessions'].create_index('token', unique=True)
    app.data.driver.db['views'].create_index([
        ('project', pymongo.ASCENDING),
        ('name', pymongo.ASCENDING)
    ], unique=True)
