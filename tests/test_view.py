from app.lib.measurement import filters_to_mongo_selection


def test_mongo_filters_conversion():
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

    assert filters_to_mongo_selection(filters) == {
        'a.b': 1,
        'a.c': {
            '$gte': 5
        }
    }
