from app.db.loginsession import LoginSessionRepo
from .uploadtoken import UploadTokenRepo


def init_database(app):
    LoginSessionRepo(app).create_indices()
    UploadTokenRepo(app).create_indices()
