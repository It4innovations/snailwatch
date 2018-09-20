import json

from .measurement import get_measurement_data
from .util import clean_key, get_value


class Exporter(object):
    def start_stream(self):
        raise StopIteration()

    def end_stream(self):
        raise StopIteration()

    def serialize_item(self, item):
        raise NotImplementedError()

    def end_item(self):
        raise StopIteration()


class CSVExporter(Exporter):
    def __init__(self, measurement_keys):
        self.keys = [k for k in measurement_keys
                     if k.startswith("environment.") or
                     k.startswith("result.")]
        self.keys = (k for k in self.keys if not k.endswith(".type"))
        self.keys = sorted(self.keys)
        self.header_keys = (clean_key(k).capitalize() for k in self.keys)

    def start_stream(self):
        yield "Benchmark;Timestamp;{}\n".format(";".join(self.header_keys))

    def serialize_item(self, item):
        values = (get_value(item, k, lambda i: str(i)) for k in self.keys)
        values = (v if v is not None else "" for v in values)

        yield "{};{};{}".format(item['benchmark'],
                                item['timestamp'],
                                ";".join(values)
                                )

    def end_item(self):
        yield "\n"


class JSONExporter(Exporter):
    def start_stream(self):
        yield "["

    def serialize_item(self, item):
        item.update({
            'timestamp': item['timestamp'].strftime('%d. %m. %Y %H:%M:%S')
        })
        yield json.dumps(item)

    def end_item(self):
        yield ","

    def end_stream(self):
        yield "]"


def get_exporter(project, format):
    if format == "csv":
        return CSVExporter(project['measurementKeys'])
    elif format == "json":
        return JSONExporter()
    else:
        raise Exception("Format {} not supported".format(format))


def export_measurements(project, measurements, format):
    exporter = get_exporter(project, format)

    yield from exporter.start_stream()

    first = True

    for m in measurements:
        if not first:
            yield from exporter.end_item()

        if first:
            first = False

        data = get_measurement_data(m)
        yield from exporter.serialize_item(data)
    yield from exporter.end_stream()
