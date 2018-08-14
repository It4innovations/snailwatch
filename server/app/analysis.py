from server.app.util import group_by


class Analyser(object):
    def __init__(self, measurement_repo):
        self.measurement_repo = measurement_repo

    # assumes that trigger values are unique
    def check(self, user, analysis):
        trigger = analysis['trigger']
        observed = analysis['observedvalue']
        if not trigger or not observed:
            return None

        measurements = self.measurement_repo.get_measurements(user,
                                                              analysis.filters)
        by_trigger = group_by(measurements, lambda m: m[trigger])
        averages = {}
        for (k, v) in by_trigger.items():
            values = map(lambda m: m[observed], v)
            average = float(sum(values)) / len(values)
            averages[k] = {
                'avg': average,
                'date': min(map(lambda m: m['timestamp'], v))
            }

        print(averages)
