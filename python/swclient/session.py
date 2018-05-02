import requests
import datetime

from .common import SnailwatchException


class Session:

    def __init__(self, server_url, token):
        if "://" not in server_url:
            server_url = "http://" + server_url
        self.server_url = server_url
        self.token = token

    def _post(self, address, payload):
        http_headers = {
            'Content-Type': 'application/json',
            'Authorization': self.token
        }

        response = requests.post(
            '{}/{}'.format(self.server_url, address),
            json=payload,
            headers=http_headers)

        if response.status_code != 201:
            raise SnailwatchException('Remote request failed, '
                                      'status: {}, message: {}',
                                      response.status_code, response.content)
        return response.json()

    def upload_measurement(
            self, benchmark, environment, result, timestamp=None):
        if timestamp is None:
            timestamp = datetime.datetime.utcnow()
        timestamp = timestamp.replace(microsecond=0)

        payload = {
            'benchmark': benchmark,
            'timestamp': timestamp.isoformat(),
            'environment': environment,
            'result': result
        }
        return self._post("measurements", payload)

    def create_user(self, username, password):
        payload = {
            'username': username,
            'password': password
        }
        return self._post("users", payload)
