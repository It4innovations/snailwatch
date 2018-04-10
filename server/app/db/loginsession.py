import uuid

from .repository import Repository


class LoginSessionRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['sessions']

    def create_indices(self):
        self.table.create_index('token', unique=True)

    def find_session(self, token):
        return self.table.find_one({
            'token': token
        })

    def create_session(self, user_id):
        token = str(uuid.uuid4().hex)
        session = {
            'user_id': user_id,
            'token': token
        }

        session['_id'] = self.table.insert_one(session).inserted_id
        return session
