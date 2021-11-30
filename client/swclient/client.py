import dataclasses
import datetime
from typing import Any, Dict, List, Optional

import requests

from .common import SnailwatchException


@dataclasses.dataclass
class Measurement:
    benchmark: str
    environment: Dict[str, Any]
    result: Dict[str, Any]
    timestamp: Optional[datetime.datetime] = None


class Client:
    """
    This client provides high-level functions for user and project management
    and measurement uploads.

    :param server_url: URL of the Snailwatch server
    :param token: upload token for uploading measurements, admin token for
        creating users
    """

    def __init__(self, server_url: str, token: Optional[str] = None):
        if "://" not in server_url:
            server_url = f"https://{server_url}"
        self.server_url = server_url
        self.token = token

    def upload_measurement(self, measurement: Measurement):
        """
        Uploads a measurement to the server.
        """
        return self._post("measurements", serialize_measurement(measurement))

    def upload_measurements(self, measurements: List[Measurement]):
        """
        Uploads multiple measurements at once.
        Each measurement should be specified as a tuple
        `(benchmark, environment, result, timestamp)`.

        :param measurements: List of measurements
        """
        serialized = [serialize_measurement(m) for m in measurements]
        return self._post("measurements", serialized)

    def create_user(self, username: str, password: str, email=""):
        """
        Create a user account.

        :param username: Username
        :param password: Password (minimum 8 characters)
        :param email: E-mail
        """
        payload = {
            "username": username,
            "password": password,
            "email": email
        }
        return self._post("users", payload)

    def login(self, username: str, password: str) -> str:
        """
        Log in and return a session token.

        :return: session token
        """
        payload = {
            "username": username,
            "password": password
        }
        return self._post("login", payload)["token"]

    def create_project(self, name: str, repository=""):
        """
        Create a project.

        :param name: Name of the project
        :param repository: URL of the project repository
        """
        payload = {
            "name": name,
            "repository": repository
        }
        return self._post("projects", payload)

    def _post(self, address, payload):
        http_headers = {
            "Content-Type": "application/json"
        }

        if self.token:
            http_headers["Authorization"] = self.token

        response = requests.post(
            "{}/{}".format(self.server_url, address),
            json=payload,
            headers=http_headers)

        if response.status_code <= 199 or response.status_code >= 300:
            raise SnailwatchException("Remote request failed, "
                                      "status: {}, message: {}",
                                      response.status_code, response.content)
        return response.json()


def serialize_measurement(measurement: Measurement) -> Dict[str, Any]:
    timestamp = measurement.timestamp
    if timestamp is None:
        timestamp = datetime.datetime.utcnow()
    timestamp = timestamp.replace(microsecond=0)

    return {
        "benchmark": measurement.benchmark,
        "timestamp": timestamp.isoformat(),
        "environment": measurement.environment,
        "result": measurement.result
    }
