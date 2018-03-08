class ProjectRepo(object):
    def __init__(self, app):
        self.table = app.data.driver.db['projects']

    def find_project_by_id(self, id):
        return self.table.find_one({
            '_id': id
        })
