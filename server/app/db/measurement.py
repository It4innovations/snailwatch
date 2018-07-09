from eve import ID_FIELD

from .repository import Repository


class MeasurementRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['measurements']

    def clear_measurements_for_user(self, user):
        self.table.remove({
            'owner': user[ID_FIELD]
        })
