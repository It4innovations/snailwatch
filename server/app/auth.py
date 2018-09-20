import datetime
import uuid
from functools import wraps

import werkzeug.security
from eve import ID_FIELD
from eve.auth import TokenAuth
from flask import Response, abort, current_app as app, jsonify, request, g

from .db.loginsession import LoginSessionRepo
from .db.uploadtoken import UploadTokenRepo
from .errors import api_error

AUTH_TOKEN_EXPIRATION_SEC = 3600 * 24 * 30


class Authenticator(TokenAuth):
    def authenticate(self):
        resp = Response(None, 401)
        abort(401, description='Provide token in the Authorization header',
              response=resp)


class UserAuthenticator(Authenticator):
    def check_auth(self, token, allowed_roles, resource, method):
        # new user creation
        if method == 'POST':
            from app.settings import ADMIN_AUTH_TOKEN
            return token == ADMIN_AUTH_TOKEN

        # check login session
        if not TokenAuthenticator().check_auth(token, allowed_roles,
                                               resource, method):
            return False

        session = get_session_for_token(token)
        user_id = str(session['user_id'])
        accessed_id = request.view_args[ID_FIELD]
        if user_id != accessed_id:
            abort(403, description='You are not allowed to access '
                                   'this resource')
        return True


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


def authenticate():
    resp = jsonify('Could not verify your token.\n')
    resp.status_code = 401
    return resp


def requires_auth(with_user=False):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = get_request_token(request)
            if not token or not get_session_for_token(token):
                return authenticate()
            if with_user:
                from .db.user import UserRepo
                user = UserRepo(app).get_user_from_request(request)
                if not user:
                    return api_error(404, "User not found")

                return f(user, *args, **kwargs)
            else:
                return f(*args, **kwargs)
        return decorated
    return decorator


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


def set_auth_value(token):
    g.auth_value = token
