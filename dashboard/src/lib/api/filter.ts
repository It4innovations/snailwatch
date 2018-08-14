import {groupBy, values, zipObj} from 'ramda';
import {Filter} from '../measurement/selection/filter';

const table = {
    '!=': '$ne',
    '<': '$lt',
    '<=': '$lte',
    '>': '$gt',
    '>=': '$gte',
    'contains': '$regex'
};

function serializeFilters(filters: Filter[]): {}
{
    const equals = filters.filter(f => f.operator === '==');
    if (equals.length > 0)
    {
        return equals[0].value;
    }

    const keys = filters.map(f => table[f.operator]);
    const vals = filters.map(f => f.value);

    return zipObj(keys, vals);
}

export function buildRequestFilter(filters: Filter[]): {}
{
    const byPath = groupBy(f => f.path, filters);

    const keys = Object.keys(byPath);
    const vals = values(byPath).map(serializeFilters);

    return zipObj(keys, vals);
}
