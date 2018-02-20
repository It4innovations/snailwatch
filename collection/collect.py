import json
import sys
from datetime import datetime

py2 = sys.version_info[0] < 3

if py2:
    import httplib
else:
    import http.client as httplib


def create_context(server, project, session):
    return {
        'server': server,
        'project': project,
        'session': session
    }


def send_measurement(context, benchmark, environment, result, timestamp=None):
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

    conn = httplib.HTTPConnection(context['server'])
    conn.request('POST', '/measurements', json.dumps(payload), hdr)
    response = conn.getresponse()
    data = response.read()
    if response.status != 201:
        raise Exception('Error while sending measurement, '
                        'response status: {}, error: {}', response.status,
                        data)
