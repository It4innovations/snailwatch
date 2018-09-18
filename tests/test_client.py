import datetime
import json
import shutil
from io import BytesIO

import pytest
import requests
from swclient.common import SnailwatchException


def test_session_create_user(sw_env):
    sw_env.start(do_init=False)
    s = sw_env.admin_session()
    s.create_user("SnailMaster", "SnailPassword")
    assert sw_env.db.users.find_one(
        {"username": "SnailMaster"})["username"] == "SnailMaster"


def test_cmd_upload(sw_env):
    sw_env.start()
    sw_env.run_cmd_client((sw_env.server_url,
                           "upload",
                           sw_env.upload_token,
                           "test1",
                           json.dumps({"machine": "tester"}),
                           json.dumps({"result":
                                       {"value": "321", "type": "size"}})))

    result = list(sw_env.db.measurements.find({"benchmark": "test1"}))
    assert len(result) == 1


def test_cmd_upload_file(sw_env, tmpdir):

    data = tmpdir.join("data")
    data.write("""
    {
        "benchmark": "test1",
        "environment": {"machine": "tester"},
        "result": {"rs": {"value": "321", "type": "size"}}
    }
    """)

    sw_env.start()

    sw_env.run_cmd_client((sw_env.server_url,
                           "upload-file",
                           sw_env.upload_token,
                           str(data.realpath())))

    result = list(sw_env.db.measurements.find({"benchmark": "test1"}))
    assert len(result) == 1


def test_cmd_upload_file_bulk(sw_env, tmpdir):

    data = tmpdir.join("data")
    data.write("""
    [{
        "benchmark": "test1",
        "environment": {"machine": "tester"},
        "result": {"rs": {"value": "321", "type": "size"}}
    }, {
        "benchmark": "test1",
        "environment": {"machine": "tester"},
        "result": {"rs": {"value": "321.5", "type": "size"}}
    }]
    """)

    sw_env.start()

    sw_env.run_cmd_client((sw_env.server_url,
                           "upload-file",
                           sw_env.upload_token,
                           str(data.realpath())))

    result = list(sw_env.db.measurements.find({"benchmark": "test1"}))
    assert len(result) == 2


def test_session_upload(sw_env):
    sw_env.start()
    s = sw_env.upload_session()
    s.upload_measurement("test1",
                         {"machine": "tester"},
                         {"result": {"value": "123", "type": "integer"}})
    s.upload_measurement("test1",
                         {"machine": "tester"},
                         {"result": {"value": "321", "type": "size"}})

    with pytest.raises(SnailwatchException):
        s.upload_measurement("test1",
                             {"machine": "tester"},
                             {"result": {"value": "321", "type": "xxx"}})

    result = list(sw_env.db.measurements.find({"benchmark": "test1"}))
    assert len(result) == 2


def test_session_bulk_upload(sw_env):
    sw_env.start()
    s = sw_env.upload_session()

    measurements = [
        ("test1",
         {"machine": "tester"},
         {"result": {"value": "123", "type": "integer"}},
         None),
        ("test1",
         {"machine": "tester"},
         {"result": {"value": "321", "type": "size"}},
         None)
    ]

    s.upload_measurements(measurements)

    result = list(sw_env.db.measurements.find({"benchmark": "test1"}))
    assert len(result) == 2


def test_export(sw_env):
    sw_env.start()
    s = sw_env.upload_session()

    time = datetime.datetime.now().replace(microsecond=0)
    measurements = [
        ("test1",
         {"machine": "tester1"},
         {"result": {"value": 123, "type": "integer"}},
         time),
        ("test2",
         {"machine": "tester2"},
         {"result": {"value": 321, "type": "size"}},
         time)
    ]

    s.upload_measurements(measurements)

    stream = BytesIO()
    form = {
        'format': 'json',
        'project': sw_env.project_id,
        'token': sw_env.user_token
    }

    with requests.post("{}/export-measurements".format(sw_env.server_url),
                       data=form,
                       stream=True) as r:
        shutil.copyfileobj(r.raw, stream)
    data = json.loads(stream.getvalue().decode('utf-8'))

    assert len(data) == 2

    for i, d in enumerate(data):
        assert d['benchmark'] == measurements[i][0]
        assert d['environment'] == measurements[i][1]
        assert d['result'] == measurements[i][2]
        assert datetime.datetime.strptime(
            d['timestamp'], "%d. %m. %Y %H:%M:%S") == measurements[i][3]


def test_clear_measurements(sw_env):
    sw_env.start()
    s = sw_env.upload_session()

    measurements = [
        ("test1",
         {"machine": "tester1"},
         {"result": {"value": 123, "type": "integer"}},
         None),
        ("test2",
         {"machine": "tester2"},
         {"result": {"value": 321, "type": "size"}},
         None)
    ]

    s.upload_measurements(measurements)

    s = sw_env.user_session()
    assert requests.delete("{}/projects/{}/measurements"
                           .format(sw_env.server_url, sw_env.project_id),
                           headers={
                               'Authorization': s.token
                           })

    assert sw_env.db.measurements.count() == 0
