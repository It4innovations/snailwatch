from bson import ObjectId
from eve import ID_FIELD

from .repository import Repository


class UploadTokenRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['uploadtokens']

    def create_indices(self):
        self.table.create_index('token', unique=True)
        self.table.create_index('project', unique=True)

    def create_token(self, project, user, token):
        self.table.insert_one({
            'project': project[ID_FIELD],
            'owner': ObjectId(user[ID_FIELD]),
            'token': token
        })

    def find_token(self, token):
        return self.table.find_one({
            'token': token
        })

    def find_token_by_project(self, project_id):
        return self.table.find_one({
            'project': self.normalize_id(project_id)
        })

    def get_token_from_request(self, request):
        token = request.headers.get('Authorization', None)
        if not token:
            return None

        token = self.find_token(token)
        if not token:
            return None

        return token

    def update_token(self, upload_token, value):
        self.table.update({
            ID_FIELD: upload_token[ID_FIELD]
        }, {
            '$set': {
                'token': value
            }
        })
