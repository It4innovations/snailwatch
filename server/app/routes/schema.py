import os

from flask import Response

from ..snailwatch import app

SCHEMA_FILE = os.path.join(os.path.dirname(os.path.dirname(
    os.path.dirname(os.path.abspath(__file__)))), "schema.json")


@app.route('/schema', methods=['GET'])
def schema():
    with open(SCHEMA_FILE) as f:
        response = f.read()
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=snailwatch.json'
    }

    return Response(response, 200, headers)
