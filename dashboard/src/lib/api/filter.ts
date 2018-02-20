import {Filter, Operator} from '../view/filter';
import {zipObj} from 'ramda';

const table = {
    '!=': '$ne',
    '<': '$lt',
    '<=': '$lte',
    '>': '$gt',
    '>=': '$gte',
    'contains': '$regex'
};

function serializeOperator(operator: Operator, value: string): {}
{
    if (operator === '==')
    {
        return value;
    }

    return {
        [table[operator]]: value
    };
}

export function buildRequestFilter(filters: Filter[]): string
{
    const keys = filters.map(f => f.path);
    const values = filters.map(f => serializeOperator(f.operator, f.value));

    return JSON.stringify(zipObj(keys, values));
}
