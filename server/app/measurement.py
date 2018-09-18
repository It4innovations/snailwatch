from .util import group_by

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


def get_measurement_data(measurement):
    return {
        'benchmark': measurement['benchmark'],
        'timestamp': measurement['timestamp'],
        'environment': measurement['environment'],
        'result': measurement['result']
    }
