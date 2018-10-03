import {contains} from 'ramda';
import {getValueWithPath} from '../../util/object';
import {Filter} from './filter';

export type Operator = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'contains';

export interface Filter
{
    path: string;
    operator: Operator;
    value: string;
}

export class BadValueFilteredError extends Error
{
    constructor(m: string)
    {
        super(m);

        Object.setPrototypeOf(this, BadValueFilteredError.prototype);
    }
}

export function createFilter(path: string = '', operator: Operator = '==', value: string = ''): Filter
{
    return {
        path,
        operator,
        value
    };
}

export function stringifyFilter(filter: Filter): string
{
    return `${filter.path} ${filter.operator} ${filter.value}`;
}

export function testFilter<T>(data: T, filter: Filter): boolean
{
    if (filter.path === '') return true;

    const value = getValueWithPath(data, filter.path);
    if (value === undefined) return true;

    if (!isInt(value) && !isString(value))
    {
        throw new BadValueFilteredError(`Trying to filter ${filter.path} with invalid type ${typeof value}`);
    }

    const actual = convert(value.toString());
    const expected = convert(filter.value.toString());

    if (isString(actual) !== isString(expected) &&
        !isOperatorExact(filter.operator))
    {
        throw new BadValueFilteredError(
            `Trying to filter integer with string (${filter.path}: ${actual}, ${expected})`);
    }

    try
    {
        return evaluateOperator(filter.operator,
            actual,
            expected
        );
    }
    catch (e)
    {
        return false;
    }
}
export function applyFilters<T>(data: T[], filters: Filter[]): T[]
{
    let result = [...data];
    for (const filter of filters)
    {
        result = result.filter(item => testFilter(item, filter));
    }
    return result;
}

function evaluateOperator(operator: Operator,
                          actualValue: string | number,
                          referenceValue: string | number): boolean
{
    switch (operator)
    {
        case '==':
            return actualValue === referenceValue;
        case '!=':
            return actualValue !== referenceValue;
        case '<':
            return actualValue < referenceValue;
        case '<=':
            return actualValue <= referenceValue;
        case '>':
            return actualValue > referenceValue;
        case '>=':
            return actualValue >= referenceValue;
        case 'contains':
            return new RegExp(referenceValue.toString()).test(actualValue.toString());
        default:
            return false;
    }
}

function isInt(value: number | string): boolean
{
    if (typeof value === 'number') return true;

    return !isNaN(Number(value));
}
function isString(x: {})
{
    return Object.prototype.toString.call(x) === '[object String]';
}

function isOperatorExact(operator: Operator): boolean
{
    return contains(operator, ['==', '!=', 'contains']);
}

function convert(value: string): string | number
{
    if (value === '') return value;
    if (isInt(value)) return Number(value);
    return value;
}
