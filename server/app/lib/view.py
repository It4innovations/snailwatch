import numbers
import re

from .util import get_value


def convert_to_num(x):
    try:
        return float(x)
    except ValueError:
        return str(x)


ops = {
    '==': lambda a, f: convert_to_num(a) == convert_to_num(f),
    '!=': lambda a, f: convert_to_num(a) != convert_to_num(f),
    '<': lambda a, f: convert_to_num(a) < convert_to_num(f),
    '<=': lambda a, f: convert_to_num(a) <= convert_to_num(f),
    '>': lambda a, f: convert_to_num(a) > convert_to_num(f),
    '>=': lambda a, f: convert_to_num(a) >= convert_to_num(f),
    'contains': lambda r, a: bool(re.match(str(r), str(a)))
}


def test_filter(filter, measurement):
    path = filter['path']
    if not path:
        return True

    op = filter['operator']
    value = get_value(measurement, path)
    if value is None:
        return False

    if not isinstance(value, str) and not isinstance(value, numbers.Number):
        return False

    if op not in ops:
        return False

    try:
        return ops[op](value, filter['value'])
    except:
        return False


def test_view(view, measurement):
    for filter in view['filters']:
        if not test_filter(filter, measurement):
            return False
    return True
