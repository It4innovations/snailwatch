from eve import Eve


def init_database(app: Eve):
    app.data.driver.db['sessions'].create_index("token", unique=True)
