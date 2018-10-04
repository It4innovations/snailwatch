import datetime


def test_batch_entry_count(sw_env):
    sw_env.start()
    uploader = sw_env.upload_client()

    measurements_a = []
    measurements_b = []

    now = datetime.datetime.now()
    for i in range(50):
        measurements_a.append((
            "B1",
            {"commit": "a", "test": "x"},
            {"res": {
                "value": i,
                "type": "time"
            }},
            now + datetime.timedelta(minutes=i)
        ))
        measurements_b.append((
            "B2",
            {"commit": "b"},
            {"res": {
                "value": i,
                "type": "time"
            }},
            now + datetime.timedelta(minutes=i)
        ))
    uploader.upload_measurements(measurements_a + measurements_b)

    view_a = sw_env.create_view(
        sw_env.template_view(name='a',
                             filters=[sw_env.template_operator(
                                 'environment.commit', value='a'
                             )]))
    view_b = sw_env.create_view(
        sw_env.template_view(name='b',
                             filters=[sw_env.template_operator(
                                 'environment.commit', value='b'
                             )]))
    view_c = sw_env.create_view(
        sw_env.template_view(name='c',
                             filters=[sw_env.template_operator(
                                 'environment.commit', value='a'
                             ), sw_env.template_operator(
                                 'environment.test', value='x'
                             )]))
    views = (view_a, view_b, view_c)
    target_measurements = (measurements_a, measurements_a, measurements_b)

    res = sw_env.get_batched_measurements(sw_env.project_id, {
        'views': [view_a['_id'], view_b['_id'], view_c['_id']],
        'range': {
            'entryCount': 15
        }
    })

    measurements = res['measurements']
    assert len(measurements) == 30
    for i, v in enumerate(views):
        id = v['_id']
        assert id in res['views']
        assert all(mid in measurements for mid in res['views'][id])

        view_measurements = tuple(measurements[id]
                                  for id
                                  in res['views'][view_a['_id']])
        target = target_measurements[i]
        assert (tuple(m['result']['res']['value'] for m in view_measurements)
                ==
                tuple(result['res']['value'] for (b, env, result, t)
                      in target[:-16:-1]))


def test_batch_date_range(sw_env):
    sw_env.start()
    uploader = sw_env.upload_client()

    measurements_a = []
    measurements_b = []

    now = datetime.datetime.now()
    for i in range(50):
        measurements_a.append((
            "B1",
            {"commit": "a", "test": "x"},
            {"res": {
                "value": i,
                "type": "time"
            }},
            now + datetime.timedelta(minutes=i)
        ))
        measurements_b.append((
            "B2",
            {"commit": "b"},
            {"res": {
                "value": i,
                "type": "time"
            }},
            now + datetime.timedelta(minutes=i)
        ))
    uploader.upload_measurements(measurements_a + measurements_b)

    view_a = sw_env.create_view(
        sw_env.template_view(name='a',
                             filters=[sw_env.template_operator(
                                 'environment.commit', value='a'
                             )]))
    view_b = sw_env.create_view(
        sw_env.template_view(name='b',
                             filters=[sw_env.template_operator(
                                 'environment.commit', value='b'
                             )]))
    view_c = sw_env.create_view(
        sw_env.template_view(name='c',
                             filters=[sw_env.template_operator(
                                 'environment.commit', value='a'
                             ), sw_env.template_operator(
                                 'environment.test', value='x'
                             )]))
    views = (view_a, view_b, view_c)
    target_measurements = (measurements_a, measurements_a, measurements_b)

    start = now + datetime.timedelta(minutes=10)
    end = now + datetime.timedelta(minutes=19)

    res = sw_env.get_batched_measurements(sw_env.project_id, {
        'views': [view_a['_id'], view_b['_id'], view_c['_id']],
        'range': {
            'from': start.strftime("%Y-%m-%dT%H:%M:%S"),
            'to': end.strftime("%Y-%m-%dT%H:%M:%S")
        }
    })

    measurements = res['measurements']
    assert len(measurements) == 20
    for i, v in enumerate(views):
        id = v['_id']
        assert id in res['views']
        assert all(mid in measurements for mid in res['views'][id])

        view_measurements = tuple(measurements[id]
                                  for id
                                  in res['views'][view_a['_id']])
        target = target_measurements[i]
        assert (tuple(m['result']['res']['value'] for m in view_measurements)
                ==
                tuple(result['res']['value'] for (b, env, result, t)
                      in target[19:9:-1]))


def test_batch_empty_filter(sw_env):
    sw_env.start()
    uploader = sw_env.upload_client()

    measurements = []

    for i in range(50):
        measurements.append((
            "B1",
            {"commit": "a", "test": "x"},
            {"res": {
                "value": i,
                "type": "time"
            }},
            None
        ))
    uploader.upload_measurements(measurements)

    view = sw_env.create_view(
        sw_env.template_view(name='a',
                             filters=[sw_env.template_operator(
                                 '', value=''
                             )]))

    res = sw_env.get_batched_measurements(sw_env.project_id, {
        'views': [view['_id']],
        'range': {
            'entryCount': 1000
        }
    })

    measurements = res['measurements']
    assert len(measurements) == 50
