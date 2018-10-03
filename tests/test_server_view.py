def test_view_disallow_empty_name(sw_env):
    sw_env.start()

    res = sw_env.create_view({
        'project': sw_env.project_id,
        'name': '',
        'filters': [],
        'yAxes': [],
        'watches': []
    }, unwrap=False)
    assert res.status_code == 422


def test_view_validate_operator_type(sw_env):
    sw_env.start()

    res = sw_env.create_view({
        'project': sw_env.project_id,
        'name': 'a',
        'filters': [{
            'path': '',
            'operator': 'x',
            'value': ''
        }],
        'yAxes': [],
        'watches': []
    }, unwrap=False)
    assert res.status_code == 422


def test_view_create(sw_env):
    sw_env.start()

    view = {
        'project': sw_env.project_id,
        'name': 'a',
        'filters': [{
            'path': 'b',
            'operator': '==',
            'value': 'c'
        }],
        'yAxes': ['a.b', 'c.d'],
        'watches': [{
            'id': '1',
            'groupBy': 'e.f'
        }]
    }

    res = sw_env.create_view(view, unwrap=False)
    assert res.status_code == 201
    data = res.json()

    assert '_id' in data
    assert data['project'] == view['project']
    assert data['name'] == view['name']
    assert data['filters'] == view['filters']
    assert data['yAxes'] == view['yAxes']
    assert data['watches'] == view['watches']
