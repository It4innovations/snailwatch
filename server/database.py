import pymongo
from eve import Eve


def init_database(app: Eve):
    app.data.driver.db['sessions'].create_index("token", unique=True)
    app.data.driver.db['benchmarks'].create_index([
        ("name", pymongo.DESCENDING),
        ("project",  pymongo.DESCENDING)], unique=True)
