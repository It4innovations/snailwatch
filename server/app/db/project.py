from .repository import Repository


class ProjectRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['projects']

    def find_project_by_id(self, id):
        return self.table.find_one({
            '_id': self.normalize_id(id)
        })

    def add_measurement_keys(self, project_id, keys):
        pid = self.normalize_id(project_id)

        self.table.update_one({
            '_id': pid
        }, {
            '$addToSet': {
                'measurementkeys': {
                    '$each': keys
                }
            }
        })
