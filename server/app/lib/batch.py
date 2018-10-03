from eve import ID_FIELD

from .measurement import filters_to_mongo_selection, serialize_measurement


class Batcher(object):
    def __init__(self, user, project, views, measurement_repo):
        self.views = views
        self.project = project
        self.user = user
        self.measurement_repo = measurement_repo

    def batch_measurements(self):
        """
        Loads batched measurements for the given `views`.
        :return: tuple of ('measurement id' -> measurement,
                            view_id -> measurement id[])
        """
        measurement_dict = {}
        views_dict = {}
        for view in self.views:
            measurements = self.load(view)
            ids = []

            for m in measurements:
                mid = str(m[ID_FIELD])
                if mid not in measurement_dict:
                    measurement_dict[mid] = serialize_measurement(m)
                ids.append(mid)

            views_dict[str(view[ID_FIELD])] = ids

        return (measurement_dict, views_dict)

    def load(self, view):
        raise NotImplementedError()


class EntryCountBatcher(Batcher):
    def __init__(self, user, project, views, measurement_repo, entry_count):
        super().__init__(user, project, views, measurement_repo)
        self.entry_count = entry_count

    def load(self, view):
        return self.measurement_repo.get_measurements(
            self.user,
            self.project,
            filters_to_mongo_selection(view['filters']),
            self.entry_count
        )


class DateRangeBatcher(Batcher):
    def __init__(self, user, project, views, measurement_repo, start, end):
        super().__init__(user, project, views, measurement_repo)
        self.start = start
        self.end = end

    def load(self, view):
        return self.measurement_repo.get_measurements_date_range(
            self.user,
            self.project,
            self.start,
            self.end,
            filters_to_mongo_selection(view['filters']),
        )
