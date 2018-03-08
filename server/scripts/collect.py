from datetime import datetime
import requests


def create_context(server, upload_token):
    """
    Creates context for measurement results uploads.
    :param server: Address of the Snailwatch server
    :param upload_token: Upload token
    """
    return {
        'server': server,
        'upload_token': upload_token
    }


def send_measurement(context, benchmark, environment, result, timestamp=None):
    """
    Sends a measurement to the server.
    :param context: Context created by create_context function.
    :param benchmark: Benchmark name
    :param environment: Environment of the measurement
    :param result: Result of the measurement
    :param timestamp: Optional time of the measurement (if not given
    the current time is recorded)
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
    else:
        timestamp = timestamp.replace(microsecond=0)

    payload = {
        'benchmark': benchmark,
        'timestamp': timestamp.isoformat(),
        'environment': environment,
        'result': result
    }

    hdr = {
        'Content-Type': 'application/json',
        'Authorization': context['upload_token']
    }

    response = requests.post('{}/measurements'.format(context['server']),
                             json=payload,
                             headers=hdr)
    if response.status_code != 201:
        raise Exception('Error while sending measurement, '
                        'response status: {}, error: {}', response.status_code,
                        response.content)
