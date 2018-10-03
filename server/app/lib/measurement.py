from eve import ID_FIELD

from .util import group_by

OPERATOR_TABLE = {
    '!=': '$ne',
    '<': '$lt',
    '<=': '$lte',
    '>': '$gt',
    '>=': '$gte',
    'contains': '$regex',
    'is defined': '$exists'
}


def filters_to_mongo_selection(filters):
    obj = group_by(filters, lambda f: f['path'])

    where = {}
    for (key, filters) in obj.items():
        equals = tuple(f for f in filters if f['operator'] == '==')
        if equals:
            where[key] = equals[0]['value']
        else:
            keys = map(lambda f: OPERATOR_TABLE[f['operator']], filters)
            values = map(lambda f: f['value'], filters)
            where[key] = {
                key: True if key == '$exists' else val
                for (key, val) in zip(keys, values)
            }

    return where


def serialize_date(date):
    return date.strftime("%Y-%m-%dT%H:%M:%S")


def serialize_measurement(measurement):
    return {
        ID_FIELD: str(measurement[ID_FIELD]),
        'timestamp': serialize_date(measurement['timestamp']),
        'benchmark': measurement['benchmark'],
        'environment': measurement['environment'],
        'result': measurement['result']
    }


def get_measurement_data(measurement):
    return {
        'benchmark': measurement['benchmark'],
        'timestamp': measurement['timestamp'],
        'environment': measurement['environment'],
        'result': measurement['result']
    }
