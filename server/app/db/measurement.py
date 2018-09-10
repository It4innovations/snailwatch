from eve import ID_FIELD

from .repository import Repository
from ..measurement import serialize_filters


class MeasurementRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['measurements']

    def clear_measurements_for_user(self, user):
        self.table.remove({
            'owner': user[ID_FIELD]
        })

    def get_measurements(self, user, filters, limit):
        where = serialize_filters(filters)
        where.update({
            'owner': user[ID_FIELD]
        })

        return self.table.find(where).limit(limit).sort([('timestamp', -1)])
