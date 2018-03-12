import werkzeug.security
from eve.auth import TokenAuth
from flask import current_app as app

from .db.uploadtoken import UploadTokenRepo
from .db.loginsession import LoginSessionRepo


class AdminAuthenticator(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        from app.settings import ADMIN_AUTH_TOKEN
        return token == ADMIN_AUTH_TOKEN


class TokenAuthenticator(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        repo = LoginSessionRepo(app)
        session = repo.find_session(token)
        if session:
            self.set_request_auth_value(session['user_id'])
            return True

        return False


class MeasurementAuthenticator(TokenAuth):
    def check_auth(self, token, allowed_roles, resource, method):
        if method == "POST":
            repo = UploadTokenRepo(app)
            session = repo.find_token(token)
            if session:
                self.set_request_auth_value(session['owner'])
                return True

            return False
        else:
            return TokenAuthenticator().check_auth(token, allowed_roles,
                                                   resource, method)


def hash_password(password):
    return werkzeug.security.generate_password_hash(password)


def check_password(user, password):
    return werkzeug.security.check_password_hash(user['password'], password)
