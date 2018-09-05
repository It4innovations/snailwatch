from eve import ID_FIELD

from .repository import Repository
from ..util import group_by

OPERATOR_TABLE = {
    '!=': '$ne',
    '<': '$lt',
    '<=': '$lte',
    '>': '$gt',
    '>=': '$gte',
    'contains': '$regex'
}


def serialize_filters(filters):
    obj = group_by(filters, lambda f: f['path'])

    where = {}
    for (key, filters) in obj.items():
        equals = [f for f in filters if f['operator'] == '==']
        if equals:
            where[key] = equals[0]['value']
        else:
            keys = map(lambda f: OPERATOR_TABLE[f['operator']], filters)
            values = map(lambda f: f['value'], filters)
            where[key] = {
                key: val
                for (key, val) in zip(keys, values)
            }

    return where


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
