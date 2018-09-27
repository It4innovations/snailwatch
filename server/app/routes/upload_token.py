from flask import jsonify

from ..auth import generate_token, requires_auth
from ..db.project import ProjectRepo
from ..db.uploadtoken import UploadTokenRepo
from ..errors import api_error
from ..snailwatch import app


@app.route('/projects/<project_id>/upload-token', methods=['POST'])
@requires_auth(with_user=True)
def revoke_upload_token(user, project_id):
    project_repo = ProjectRepo(app)
    project = project_repo.find_project_by_id(project_id)
    if not project:
        api_error(404, "Project not found")

    token_repo = UploadTokenRepo(app)
    old_token = token_repo.find_token_by_project(project_id)

    if user['_id'] not in project['writers']:
        api_error(403, "You can't modify this project")

    new_token = generate_token()
    token_repo.update_token(old_token, new_token)

    return jsonify(new_token)


@app.route('/projects/<project_id>/upload-token', methods=['GET'])
@requires_auth(with_user=True)
def get_upload_token(user, project_id):
    if project_id:
        project_repo = ProjectRepo(app)
        project = project_repo.find_project_by_id(project_id)
        if not project:
            api_error(404, "Project not found")

        token_repo = UploadTokenRepo(app)
        token = token_repo.find_token_by_project(project_id)

        if user['_id'] not in project['writers']:
            api_error(403, "You can't read this project")

        return jsonify(token["token"])
    else:
        api_error(400, "Project id missing")
