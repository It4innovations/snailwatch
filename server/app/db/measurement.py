from eve import ID_FIELD

from .repository import Repository


class MeasurementRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['measurements']

    def clear_measurements_for_project(self, project):
        self.table.remove({
            'project': project[ID_FIELD]
        })

    def get_measurements(self, user, where=None, limit=0):
        if not where:
            where = {}

        where.update({
            'owner': user[ID_FIELD]
        })

        return self.table.find(where).limit(limit).sort([('timestamp', -1)])
