import datetime

from flask import jsonify, request

from ..auth import get_user_from_request, requires_auth
from ..db.measurement import MeasurementRepo
from ..db.project import ProjectRepo
from ..db.view import ViewRepo
from ..lib.measurement import batch_measurements, filters_to_mongo_selection
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

    views = list(ViewRepo(app).get_views_by_id(view_ids))
    user = get_user_from_request(request)

    measurement_repo = MeasurementRepo(app)

    if 'entryCount' in range:
        def load(view):
            return measurement_repo.get_measurements(
                user, project,
                filters_to_mongo_selection(view['filters']),
                range['entryCount']
            )

        batch = batch_measurements(views, load)
    elif 'from' in range and 'to' in range:
        format = "%Y-%m-%dT%H:%M:%S"

        try:
            start = datetime.datetime.strptime(range['from'], format)
            end = datetime.datetime.strptime(range['to'], format)
        except ValueError:
            return api_error(400)

        def load(view):
            return measurement_repo.get_measurements_date_range(
                user, project,
                start,
                end,
                filters_to_mongo_selection(view['filters'])
            )

        batch = batch_measurements(views, load)
    else:
        return api_error(400, 'Invalid range')

    (measurements, view_measurement_ids) = batch
    return jsonify({
        "measurements": measurements,
        "views": view_measurement_ids
    })
