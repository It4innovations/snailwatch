import {buildRequestFilter} from '../lib/api/filter';
import {applyFilters, BadValueFilteredError, createFilter, Filter, Operator, testFilter} from '../lib/view/filter';

describe('Filter', () =>
{
    it('passes measurements through when path is empty', () =>
    {
        const filter = createFilter({ path: '', operator: '==', value: 'x'});
        const obj = {
            a: {
                b: 'x'
            }
        };

        expect(testFilter(obj, filter)).toBe(true);
    });
    it('can navigate to nested properties', () =>
    {
        const filter = createFilter({ path: 'a.b', operator: '==', value: 'x'});
        const obj = {
            a: {
                b: 'x'
            }
        };

        expect(testFilter(obj, filter)).toBe(true);
    });

    it('handles inexact comparison of numeric string and integer', () =>
    {
        const filter = createFilter({path: 'val', operator: '<', value: '2'});
        const obj = {
            val: 100
        };

        expect(testFilter(obj, filter)).toBe(false);
    });
    it('throws if non-numeric string is compared inexactly with integer', () =>
    {
        const filter = createFilter({path: 'val', operator: '<', value: '2'});
        const obj = {
            val: 'asd'
        };

        expect(() => {
            testFilter(obj, filter);
        }).toThrow(BadValueFilteredError);
    });
    it('handles exact comparison of string and integer', () =>
    {
        const filter = createFilter({path: 'val', operator: '==', value: '2'});
        const obj = {
            val: 2
        };

        expect(testFilter(obj, filter)).toBe(true);
    });
    it('handles regex evaluation', () =>
    {
        const filter = createFilter({path: 'a', operator: 'contains', value: '^\\d+$'});
        expect(testFilter({ a: 5 }, filter)).toBe(true);
        expect(testFilter({ a: '' }, filter)).toBe(false);
        expect(testFilter({ a: 'asd' }, filter)).toBe(false);
    });
    it('handles invalid regex query', () =>
    {
        const filter = createFilter({path: 'a', operator: 'contains', value: '[[]]]][*.+\\d+'});
        expect(testFilter({ a: 5 }, filter)).toBe(false);
    });

    const operatorData: {
        operator: Operator,
        left: number | string,
        right: string,
        result: boolean
    }[] = [{
        operator: '==',
        left: '5',
        right: '5',
        result: true
    }, {
        operator: '==',
        left: '5',
        right: '6',
        result: false
    }, {
        operator: '!=',
        left: '5',
        right: '5',
        result: false
    }, {
        operator: '!=',
        left: '5',
        right: '6',
        result: true
    }, {
        operator: '<',
        left: '5',
        right: '6',
        result: true
    }, {
        operator: '<',
        left: '6',
        right: '3',
        result: false
    }, {
        operator: '<=',
        left: '5',
        right: '5',
        result: true
    }, {
        operator: '<=',
        left: '5',
        right: '6',
        result: true
    }, {
        operator: '<=',
        left: '6',
        right: '1',
        result: false
    }, {
        operator: '>',
        left: '5',
        right: '6',
        result: false
    }, {
        operator: '>',
        left: '100',
        right: '1',
        result: true
    }, {
        operator: '>=',
        left: '5',
        right: '6',
        result: false
    }, {
        operator: '>=',
        left: '8',
        right: '8',
        result: true
    }, {
        operator: '>=',
        left: '1',
        right: '0',
        result: true
    }];

    for (const data of operatorData)
    {
        it(`evaluates ${data.left} ${data.operator} ${data.right} is ${data.result}`, () =>
        {
            const filter = createFilter({path: 'val', operator: data.operator, value: data.right});
            const obj = {
                val: data.left
            };

            expect(testFilter(obj, filter)).toBe(data.result);
        });
    }
});
describe('applyFilter', () =>
{
    it('applies filter', () => {
        const filter = createFilter({path: 'item', operator: '==', value: 'a'});
        const objs = [
            { item: 'a' },
            { item: 'b' },
            { item: 'a' },
            { item: 'c' }
        ];

        expect(applyFilters(objs, [filter])).toEqual([objs[0], objs[2]]);
    });
    it('applies multiple filters', () => {
        const filters = [
            createFilter({path: 'item', operator: '==', value: 'a'}),
            createFilter({path: 'test', operator: '==', value: 'c'})
        ];
        const objs = [
            { item: 'a', test: 'x' },
            { item: 'b', test: 'b' },
            { item: 'a', test: 'c' },
            { item: 'c', test: 'a' }
        ];

        expect(applyFilters(objs, filters)).toEqual([objs[2]]);
    });
});
describe('buildRequestFilter', () => {
    it('groups multiple path entries', () => {
        const filters: Filter[] = [createFilter({
            path: 'a',
            operator: '<',
            value: '9'
        }), createFilter({
            path: 'a',
            operator: '>=',
            value: '8'
        })];

        const expected = {
            a: {
                $lt: '9',
                $gte: '8'
            }
        };
        expect(buildRequestFilter(filters)).toEqual(expected);
    });
    it('ignores empty path filters', () => {
        const filters: Filter[] = [createFilter({
            path: '',
            operator: '<',
            value: '9'
        }), createFilter({
            path: '    ',
            operator: '>=',
            value: '8'
        })];

        expect(buildRequestFilter(filters)).toEqual({});
    });
    it('selects equal operator', () => {
        const filters: Filter[] = [createFilter({
            path: 'a',
            operator: '>=',
            value: '9'
        }), createFilter({
            path: 'a',
            operator: '==',
            value: '8'
        })];

        const expected = {
            a: '8'
        };
        expect(buildRequestFilter(filters)).toEqual(expected);
    });
});
