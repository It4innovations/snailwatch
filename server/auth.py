import werkzeug.security
import uuid
from eve.auth import TokenAuth
from flask import current_app as app


class AdminAuthenticator(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        from settings import ADMIN_AUTH_TOKEN
        return token == ADMIN_AUTH_TOKEN


class TokenAuthenticator(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        session = find_session(token)
        if session:
            self.set_request_auth_value(session["user_id"])
            return True

        return False


def init_auth(app):
    app.data.driver.db['sessions'].create_index("token", unique=True)


def find_session(token: str) -> dict:
    sessions = app.data.driver.db['sessions']
    session = sessions.find_one({
        "token": token
    })
    return session


def create_session(user_id: str) -> str:
    token = str(uuid.uuid4().hex)
    session = {
        "user_id": user_id,
        "token": token
    }

    sessions = app.data.driver.db['sessions']
    sessions.insert_one(session)
    return token


def find_user_by_username(username: str) -> dict:
    users = app.data.driver.db['users']
    user = users.find_one({
        "username": username
    })
    return user


def hash_password(password: str):
    return werkzeug.security.generate_password_hash(password)


def check_password(user: dict, password: str):
    return werkzeug.security.check_password_hash(user["password"], password)
