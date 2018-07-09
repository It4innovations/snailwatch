from eve import ID_FIELD

from .repository import Repository
from .loginsession import LoginSessionRepo


class UserRepo(Repository):
    def __init__(self, app):
        self.app = app
        self.table = app.data.driver.db['users']

    def find_user_by_username(self, username):
        return self.table.find_one({
            'username': username
        })

    def find_user_by_id(self, id):
        return self.table.find_one({
            ID_FIELD: self.normalize_id(id)
        })

    def update_user_password(self, user, password):
        self.table.update({
            ID_FIELD: user[ID_FIELD]
        }, {
            '$set': {
                'password': password
            }
        })

    def get_user_from_request(self, request):
        token = request.headers.get('Authorization', None)
        if not token:
            return None
        login_repo = LoginSessionRepo(self.app)

        session = login_repo.find_session(token)
        if not session:
            return None

        return self.find_user_by_id(session['user_id'])
