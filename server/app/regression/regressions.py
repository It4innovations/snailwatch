from flask import current_app as app

from ..db.measurement import MeasurementRepo
from ..db.view import ViewRepo
from ..util import get_value, group_by


class MeasurementGroup(object):
    def __init__(self, key, average, measurements, date):
        self.key = key
        self.average = average
        self.measurements = measurements
        self.date = date


class Regression(object):
    def __init__(self, view, trigger, reference, regressed):
        self.view = view
        self.trigger = trigger
        self.regressed = regressed
        self.reference = reference


# assumes that trigger values are unique
def get_regressions(user, view, max_ratio):
    observed = view['yAxes']
    if not observed:
        return []
    if not view['watches']:
        return []

    measurements = list(MeasurementRepo(app)
                        .get_measurements(user, view['filters'], 1000))

    regressions = []
    for watch in view['watches']:
        trigger = watch['groupBy']
        for o in observed:
            groups = calculate_averages(measurements, trigger, o).items()
            groups = sorted(groups, key=lambda item: item[1].date,
                            reverse=True)
            for (i, group) in enumerate(groups[:-1]):
                current = group[1]
                older = groups[i + 1][1]
                avg = older.average
                if avg == 0:
                    continue

                if current.average / older.average > max_ratio:
                    regressions.append(Regression(view, trigger, older,
                                                  current))

    return regressions


def calculate_averages(measurements, trigger, observed):
    by_trigger = group_by(measurements,
                          lambda m: get_value(m, trigger, lambda i: str(i)))
    averages = {}
    for (key, subset) in by_trigger.items():
        values = (get_value(m, observed, lambda i: float(i)) for m in subset)
        values = [v for v in values if v is not None]
        if not values:
            continue

        averages[key] = MeasurementGroup(
            observed,
            float(sum(values)) / len(values),
            subset,
            min(m['timestamp'] for m in subset)
        )
    return averages


def check_regressions(user):
    view_repo = ViewRepo(app)

    regressions = []
    for view in view_repo.get_views_with_watches(user):
        regressions += get_regressions(user, view, 1.10)
    return regressions
