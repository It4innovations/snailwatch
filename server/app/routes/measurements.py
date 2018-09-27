from flask import jsonify

from ..auth import requires_auth
from ..db.measurement import MeasurementRepo
from ..db.project import ProjectRepo
from ..errors import api_error
from ..snailwatch import app


@app.route('/projects/<project_id>/measurements', methods=['DELETE'])
@requires_auth()
def clear_measurements(project_id):
    project = ProjectRepo(app).find_project_by_id(project_id)
    if not project:
        api_error(404)

    MeasurementRepo(app).clear_measurements_for_project(project)

    return jsonify()
