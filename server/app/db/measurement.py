from eve import ID_FIELD

from .repository import Repository


class MeasurementRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['measurements']

    def clear_measurements_for_project(self, project):
        self.table.remove({
            'project': project[ID_FIELD]
        })

    def get_measurements(self, user, project, where=None, limit=0):
        if not where:
            where = {}

        where.update({
            'owner': user[ID_FIELD],
            'project': project[ID_FIELD]
        })

        return self.table.find(where).limit(limit).sort([('timestamp', -1)])

    def get_measurements_date_range(self, user, project, start, end,
                                    where=None):
        if not where:
            where = {}

        where.update({
            'owner': user[ID_FIELD],
            'project': project[ID_FIELD],
            'timestamp': {
                '$gte': start,
                '$lte': end
            }
        })

        return self.table.find(where)
