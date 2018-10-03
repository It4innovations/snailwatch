from flask import Response, request

from ..auth import get_session_for_token, set_auth_value
from ..db.measurement import MeasurementRepo
from ..db.project import ProjectRepo
from ..db.user import UserRepo
from ..request import api_error
from ..lib.export import export_measurements
from ..snailwatch import app


@app.route('/projects/<project_id>/export-measurements', methods=['POST'])
def export_measurements_route(project_id):
    data = request.form
    format = data.get('format', None)
    token = data.get('token', None)

    if token and format in ('json', 'csv'):
        session = get_session_for_token(token)
        if not session:
            api_error(403)

        set_auth_value(session['user_id'])
        user = UserRepo(app).find_user_by_id(session['user_id'])
        if not user:
            api_error(403)

        project = ProjectRepo(app).find_project_by_id(project_id)
        if not project:
            api_error(404, "Project not found")
        measurements = MeasurementRepo(app).get_measurements(user, project)

        mime = 'application/json' if format == 'json' else 'text/csv'
        headers = {
            'Content-Type': mime,
            'Content-Disposition':
                'attachment; filename="measurements.{}"'.format(format)
        }

        return Response(
            export_measurements(project, measurements, format),
            headers=headers
        )
    else:
        api_error(400, "Bad request")
