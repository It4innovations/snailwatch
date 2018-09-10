import requests
import datetime

from .common import SnailwatchException


class Session:
    """
    This class simplifies Snailwatch API usage.

    :param server_url: URL of the Snailwatch server
    :param token: upload token for uploading measurements, admin token for
        creating users
    """

    def __init__(self, server_url, token):
        if "://" not in server_url:
            server_url = "http://" + server_url
        self.server_url = server_url
        self.token = token

    def upload_measurement(self, benchmark, environment, result,
                           timestamp=None):
        """
        Uploads a measurement to the server.

        :param benchmark: Benchmark name
        :param environment: Environment of the benchmark
        :param result: Measured result
        :param timestamp: Time of the measurement
        """
        return self._post("measurements",
                          self._serialize_measurement(benchmark, environment,
                                                      result, timestamp))

    def upload_measurements(self, measurements):
        """
        Uploads multiple measurements at once.
        Each measurement should be specified as a tuple
        `(benchmark, environment, result, timestamp)`.

        :param measurements: List of measurements
        """
        serialized = [self._serialize_measurement(*m) for m in measurements]
        return self._post("measurements", serialized)

    def create_user(self, username, password):
        """
        Create a user account.

        :param username: Username
        :param password: Password (minimum 8 characters)
        """
        payload = {
            'username': username,
            'password': password
        }
        return self._post("users", payload)

    def _post(self, address, payload):
        http_headers = {
            'Content-Type': 'application/json',
            'Authorization': self.token
        }

        response = requests.post(
            '{}/{}'.format(self.server_url, address),
            json=payload,
            headers=http_headers)

        if response.status_code <= 199 or response.status_code >= 300:
            raise SnailwatchException('Remote request failed, '
                                      'status: {}, message: {}',
                                      response.status_code, response.content)
        return response.json()

    def _serialize_measurement(self, benchmark, environment, result,
                               timestamp=None):
        if timestamp is None:
            timestamp = datetime.datetime.utcnow()
        timestamp = timestamp.replace(microsecond=0)

        return {
            'benchmark': benchmark,
            'timestamp': timestamp.isoformat(),
            'environment': environment,
            'result': result
        }
