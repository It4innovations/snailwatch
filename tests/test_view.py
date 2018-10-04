from app.lib.measurement import filters_to_mongo_selection


def test_mongo_filters_complex():
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
    }, {
        'path': 'a.f',
        'operator': 'is defined',
        'value': ''
    }]

    assert filters_to_mongo_selection(filters) == {
        'a.b': 1,
        'a.c': {
            '$gte': 5
        },
        'a.f': {
            '$exists': True
        }
    }


def test_mongo_filters_empty_path():
    filters = [{
        'path': '',
        'operator': '==',
        'value': ''
    }]

    assert filters_to_mongo_selection(filters) == {}
