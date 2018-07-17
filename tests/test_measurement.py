from ..server.app.db.measurement import serialize_filters


def test_serialize_filters():
    filters = [{
        'path': 'a.b',
        'operator': '==',
        'value': 1
    }, {
        'path': 'a.b',
        'operator': '==',
        'value': 2
    }, {
        'path': 'a.c',
        'operator': '>=',
        'value': 5
    }]

    assert serialize_filters(filters) == {
        'a.b': 1,
        'a.c': {
            '$gte': 5
        }
    }
