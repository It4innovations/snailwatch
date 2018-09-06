from functools import reduce

from .util import group_by
import operator


class MeasurementGroup(object):
    def __init__(self, key, average, measurements, date):
        self.key = key
        self.average = average
        self.measurements = measurements
        self.date = date


class Regression(object):
    def __init__(self, orig_group, regressed_group):
        self.regressed_group = regressed_group
        self.orig_group = orig_group


class Analyser(object):
    def __init__(self, measurement_repo):
        self.measurement_repo = measurement_repo

    # assumes that trigger values are unique
    def get_regressions(self, user, view, trigger, max_ratio):
        observed = view['yAxes']
        if not observed:
            return []

        measurements = self.measurement_repo\
            .get_measurements(user, view['filters'], 1000)

        regressions = []
        for o in observed:
            groups = calculate_averages(measurements, trigger, o).items()
            groups = sorted(groups, key=lambda item: item.date, reverse=True)
            for (i, group) in enumerate(groups[:-1]):
                current = group[1]
                older = groups[i + 1][1]
                avg = older.average
                if avg == 0:
                    continue

                if current.average / older.average > max_ratio:
                    regressions.append(Regression(older, current))

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


def get_value(obj, path, transform):
    try:
        return transform(reduce(operator.getitem, path.split('.'), obj))
    except (KeyError, ValueError):
        return None
