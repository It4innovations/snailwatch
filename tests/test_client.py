
from swclient.session import Session
from swclient.common import SnailwatchException
import pytest
import json


def test_session_create_user(sw_env):
    sw_env.start(do_init=False)
    s = Session(sw_env.server_url, sw_env.admin_token)
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


def test_session_upload(sw_env):
    sw_env.start()
    s = Session(sw_env.server_url, sw_env.upload_token)
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
    s = Session(sw_env.server_url, sw_env.upload_token)

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
