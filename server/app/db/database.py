from .uploadtoken import UploadTokenRepo
from ..db.loginsession import LoginSessionRepo


def init_database(app):
    LoginSessionRepo(app).create_indices()
    UploadTokenRepo(app).create_indices()
