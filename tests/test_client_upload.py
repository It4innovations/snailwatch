import json

import pytest
from swclient.common import SnailwatchException


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
    s = sw_env.upload_client()
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
    s = sw_env.upload_client()

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
