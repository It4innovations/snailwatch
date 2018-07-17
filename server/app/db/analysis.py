from eve import ID_FIELD

from .repository import Repository


class AnalysisRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['analyses']

    def get_analyses_for_user(self, user):
        self.table.find({
            'owner': user[ID_FIELD]
        })
