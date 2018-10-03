import datetime

from flask import jsonify, request

from ..auth import get_user_from_request, requires_auth
from ..db.measurement import MeasurementRepo
from ..db.project import ProjectRepo
from ..db.view import ViewRepo
from ..lib.batch import DateRangeBatcher, EntryCountBatcher
from ..request import api_error, get_json_key
from ..snailwatch import app


@app.route('/projects/<project_id>/measurements', methods=['DELETE'])
@requires_auth()
def clear_measurements(project_id):
    project = ProjectRepo(app).find_project_by_id(project_id)
    if not project:
        api_error(404)

    MeasurementRepo(app).clear_measurements_for_project(project)

    return jsonify()


@app.route('/projects/<project_id>/batched-measurements', methods=['POST'])
@requires_auth()
def load_batched_measurements(project_id):
    project = ProjectRepo(app).find_project_by_id(project_id)
    if not project:
        api_error(404)

    data = request.get_json()
    view_ids = get_json_key(data, 'views')
    range = get_json_key(data, 'range')

    views = tuple(ViewRepo(app).get_views_by_id(view_ids))
    user = get_user_from_request(request)

    measurement_repo = MeasurementRepo(app)

    if 'entryCount' in range:
        batch = EntryCountBatcher(user, project, views, measurement_repo,
                                  range['entryCount']).batch_measurements()
    elif 'from' in range and 'to' in range:
        format = "%Y-%m-%dT%H:%M:%S"
        try:
            start = datetime.datetime.strptime(range['from'], format)
            end = datetime.datetime.strptime(range['to'], format)
        except ValueError:
            return api_error(400)

        batch = DateRangeBatcher(user, project, views, measurement_repo,
                                 start, end).batch_measurements()
    else:
        return api_error(400, 'Invalid range')

    (measurements, view_measurement_ids) = batch
    return jsonify({
        "measurements": measurements,
        "views": view_measurement_ids
    })
