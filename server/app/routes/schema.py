import requests
from flask import Response

from ..snailwatch import app


@app.route('/schema', methods=['GET'])
def schema():
    response = requests.get("https://app.swaggerhub.com/apiproxy/schema"
                            "/file/IT4I/Snailwatch/0.1/swagger.json")
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=snailwatch.json'
    }

    return Response(response.content, response.status_code, headers)
