from eve.methods.post import post_internal

from .repository import Repository


class ViewRepo(Repository):
    def __init__(self, app):
        self.table = app.data.driver.db['views']

    def get_views_with_benchmark(self, benchmark):
        return self.table.find({
            'filters': [{
                'path': 'benchmark',
                'operator': '==',
                'value': benchmark
            }]
        })

    def create_internal(self, project_id, name, filters, y_axes):
        return post_internal('views', {
            'project': project_id,
            'name': name,
            'filters': filters,
            'yAxes': y_axes
        })
