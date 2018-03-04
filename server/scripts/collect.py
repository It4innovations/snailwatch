from datetime import datetime
import requests


def create_context(server, project, session):
    """
    Creates context for measurements uploads.
    :param server: Address of the Snailwatch server
    :param project: Project id
    :param session: Session token
    """
    return {
        'server': server,
        'project': project,
        'session': session
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
        'project': context['project'],
        'benchmark': benchmark,
        'timestamp': timestamp.isoformat(),
        'environment': environment,
        'result': result
    }

    hdr = {
        'Content-Type': 'application/json',
        'Authorization': context['session']
    }

    response = requests.post("{}/measurements".format(context['server']),
                             json=payload,
                             headers=hdr)
    if response.status_code != 201:
        raise Exception('Error while sending measurement, '
                        'response status: {}, error: {}', response.status_code,
                        response.content)
