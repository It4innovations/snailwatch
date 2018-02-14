def init_database(app):
    app.data.driver.db['sessions'].create_index("token", unique=True)
