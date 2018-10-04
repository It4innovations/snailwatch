from eve import ID_FIELD
from eve.methods.post import post_internal

from .repository import Repository


class ViewRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['views']

    def get_view_by_id(self, id):
        return self.table.find({
            ID_FIELD: self.normalize_id(id)
        })

    def get_views_by_id(self, ids):
        return self.table.find({
            ID_FIELD: {
                "$in": tuple(self.normalize_id(id) for id in ids)
            }
        })

    def get_views_with_benchmark(self, benchmark):
        return self.table.find({
            'filters': {
                '$size': 1,
                '$elemMatch': {
                    'path': 'benchmark',
                    'operator': '==',
                    'value': benchmark
                }
            }
        })

    def get_views_for_user(self, user):
        return self.table.find({
            'owner': user[ID_FIELD]
        })

    def get_views_with_watches(self, user, project):
        return self.table.find({
            'owner': user[ID_FIELD],
            'project': project[ID_FIELD],
            'watches': {
                '$exists': True,
                '$ne': []
            }
        })

    def create_internal(self, project_id, name, filters, y_axes):
        return post_internal('views', {
            'project': project_id,
            'name': name,
            'filters': filters,
            'yAxes': y_axes,
            'watches': []
        })
