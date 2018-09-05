import datetime
import uuid

import werkzeug.security
from eve.auth import TokenAuth
from flask import Response, abort, current_app as app

from .db.loginsession import LoginSessionRepo
from .db.uploadtoken import UploadTokenRepo

AUTH_TOKEN_EXPIRATION_SEC = 3600 * 24 * 30


class Authenticator(TokenAuth):
    def authenticate(self):
        resp = Response(None, 401)
        abort(401, description='Provide token in the Authorization header',
              response=resp)


class AdminAuthenticator(Authenticator):
    def check_auth(self, token, allowed_roles, resource, method):
        from app.settings import ADMIN_AUTH_TOKEN
        return token == ADMIN_AUTH_TOKEN


class TokenAuthenticator(Authenticator):
    def check_auth(self, token, allowed_roles, resource, method):
        session = get_session_for_token(token)
        if not session:
            return False
        else:
            self.set_request_auth_value(session['user_id'])
            return True


class MeasurementAuthenticator(Authenticator):
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


def generate_token():
    return str(uuid.uuid4().hex)


def get_request_token(request):
    return request.headers.get('Authorization', None)


def get_session_for_token(token):
    repo = LoginSessionRepo(app)
    session = repo.find_session(token)
    if session:
        ts_utc = datetime.datetime.utcnow().replace(tzinfo=None)
        time_delta = ts_utc - session['timestamp'].replace(tzinfo=None)
        if time_delta.total_seconds() >= AUTH_TOKEN_EXPIRATION_SEC:
            return None

        return session
    return None


def get_session_from_request(request):
    return get_session_for_token(get_request_token(request))
