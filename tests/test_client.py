import datetime
import json
import os
import shutil
from io import BytesIO

import pytest
import requests
from swclient.common import SnailwatchException


def test_session_create_user(sw_env):
    sw_env.start(do_init=False)
    s = sw_env.admin_session()

    email = "test@test.com"
    s.create_user("SnailMaster", "SnailPassword", email)
    user = sw_env.db.users.find_one({"username": "SnailMaster"})
    assert user
    assert user["username"] == "SnailMaster"
    assert user["email"] == email


def test_session_create_project(sw_env):
    sw_env.start()
    s = sw_env.user_session()

    name = "P1"
    repo = "https://myrepo.com"
    s.create_project(name, repo)

    assert sw_env.db.projects.find_one(
        {"name": name})["repository"] == repo


def test_session_login(sw_env):
    sw_env.start(do_init=False)
    s = sw_env.admin_session()

    user = "a"
    s.create_user(user, user)
    token = s.login(user, user)

    sessions = list(sw_env.db.sessions.find({}))
    assert len(sessions) == 1
    assert sessions[0]['token'] == token


def test_cmd_create_user(sw_env):
    sw_env.start(do_init=False)

    read, write = os.pipe()
    os.write(write, b"pass")
    os.close(write)

    name = "user1"
    email = "test@test.com"
    res = sw_env.run_cmd_client((sw_env.server_url,
                                 "create-user",
                                 sw_env.admin_token,
                                 name,
                                 "--email",
                                 email), stdin=read)

    result = list(sw_env.db.users.find({"username": name}))
    assert len(result) == 1
    assert result[0]["email"] == email

    sessions = list(sw_env.db.sessions.find({}))
    assert len(sessions) == 1
    assert sessions[0]['token'] in res.decode('utf-8')


def test_cmd_create_project(sw_env):
    sw_env.start()

    name = "P1"
    repo = "https://myrepo.com"
    res = sw_env.run_cmd_client((sw_env.server_url,
                                 "create-project",
                                 sw_env.user_token,
                                 name,
                                 "--repository",
                                 repo))

    projects = list(sw_env.db.projects.find({"name": name}))
    assert len(projects) == 1
    assert projects[0]["repository"] == repo

    upload_sessions = list(sw_env.db.uploadtokens.find({
        'project': projects[0]['_id']
    }))
    assert len(upload_sessions) == 1
    assert upload_sessions[0]['token'] in res.decode('utf-8')


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

    with requests.post("{}/projects/{}/export-measurements".format(
            sw_env.server_url, sw_env.project_id),
                       data=form,
                       stream=True) as r:
        assert r.status_code == 200
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
                           }).status_code == 200

    assert sw_env.db.measurements.count() == 0
