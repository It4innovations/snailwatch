
import os
import sys
import pytest
import subprocess
import time
import signal
import requests
import shutil

from pymongo import MongoClient
from swclient.session import Session

TEST_DIR = os.path.dirname(__file__)
ROOT = os.path.dirname(TEST_DIR)
WORK_DIR = os.path.join(TEST_DIR, "work")
SNAILWATCH_SERVER = os.path.join(ROOT, "server", "start.py")
PYTHON_DIR = os.path.join(ROOT, "python")
SERVER_DIR = os.path.join(ROOT, "server")

MONGO_ADDRESS = os.environ.get('MONGO', 'localhost')

sys.path.insert(0, PYTHON_DIR)
sys.path.insert(0, SERVER_DIR)


class Env:

    def __init__(self):
        self.processes = []
        self.cleanups = []

    def start_process(self, name, args, env=None, catch_io=True):
        fname = os.path.join(WORK_DIR, name)
        if catch_io:
            with open(fname + ".out", "w") as out:
                p = subprocess.Popen(args,
                                     preexec_fn=os.setsid,
                                     stdout=out,
                                     stderr=out,
                                     cwd=WORK_DIR,
                                     env=env)
        else:
            p = subprocess.Popen(args,
                                 cwd=WORK_DIR,
                                 env=env)
        self.processes.append((name, p))
        return p

    def kill_all(self):
        for fn in self.cleanups:
            fn()
        for n, p in self.processes:
            # Kill the whole group since the process may spawn a child
            if not p.poll():
                os.killpg(os.getpgid(p.pid), signal.SIGTERM)


class SnailWatchEnv(Env):

    port = 5011
    mongo_port = None
    admin_token = "ABC1"
    user_token = None
    upload_token = None
    db_name = "sw-test"

    def __init__(self):
        super().__init__()
        self.mongo_client = MongoClient(MONGO_ADDRESS, self.mongo_port)
        self.mongo_client.drop_database(self.db_name)
        self.db = self.mongo_client[self.db_name]

    def run_cmd_client(self, args, stdin=None):
        env = os.environ.copy()
        env["PYTHONPATH"] = PYTHON_DIR
        subprocess.check_call(
            ("python3", "-m", "swclient") + args, env=env, stdin=stdin)

    def make_env(self):
        env = os.environ.copy()
        env.update({
            "ADMIN_TOKEN": self.admin_token,
            "MONGO_HOST": MONGO_ADDRESS,
            "MONGO_DB": self.db_name,
            "MONGO_PORT": "27017",
            "PORT": str(self.port)})
        return env

    def upload_session(self):
        return Session(self.server_url, self.upload_token)

    def admin_session(self):
        return Session(self.server_url, self.admin_token)

    def start(self, do_init=True):
        env = self.make_env()
        self.start_process("server", ("python3", SNAILWATCH_SERVER), env=env)
        time.sleep(3)

        if do_init:
            self.create_user("tester", "testpass")
            self.user_token = self.login("tester", "testpass")["token"]
            self.project_id = self.create_project("project1")["_id"]
            self.upload_token = self.get_upload_token(self.project_id)

    def _request(self, address, payload, token):
        http_headers = {
            'Content-Type': 'application/json',
        }

        if token:
            http_headers['Authorization'] = token

        if payload is None:
            response = requests.get(
                '{}/{}'.format(self.server_url, address),
                headers=http_headers)
        else:
            response = requests.post(
                '{}/{}'.format(self.server_url, address),
                json=payload,
                headers=http_headers)

        if response.status_code not in (200, 201):
            raise Exception('Remote request failed, '
                            'status: {}, message: {}',
                            response.status_code, response.content)
        return response.json()

    def get_upload_token(self, project_id):
        return self._request(
            "get-upload-token/" + project_id, None, self.user_token)

    def login(self, username, password):
        payload = {
            'username': username,
            'password': password
        }
        return self._request("login", payload, None)

    def create_user(self, username, password):
        payload = {
            'username': username,
            'password': password
        }
        return self._request("users", payload, self.admin_token)

    def create_project(self, name):
        payload = {
            'name': name,
        }
        return self._request("projects", payload, self.user_token)

    @property
    def server_url(self):
        return "http://localhost:{}".format(self.port)


def prepare():
    """Prepare working directory

    If directory exists then it is cleaned;
    If it does not exists then it is created.
    """
    if os.path.isdir(WORK_DIR):
        for root, dirs, files in os.walk(WORK_DIR):
            for d in dirs:
                os.chmod(os.path.join(root, d), 0o700)
            for f in files:
                os.chmod(os.path.join(root, f), 0o700)
        for item in os.listdir(WORK_DIR):
            path = os.path.join(WORK_DIR, item)
            if os.path.isfile(path):
                os.unlink(path)
            else:
                shutil.rmtree(path)
    else:
        os.makedirs(WORK_DIR)
    os.chdir(WORK_DIR)


@pytest.yield_fixture(autouse=True, scope="function")
def sw_env():
    prepare()
    env = SnailWatchEnv()
    yield env
    time.sleep(0.2)
    try:
        pass  # TODO: env.final_check()
    finally:
        env.kill_all()
        # Final sleep to let server port be freed, on some slow computers
        # a new test is starter before the old server is properly cleaned
        time.sleep(1)
