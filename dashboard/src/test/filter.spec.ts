import {BadValueFilteredError, createFilter, Operator, testFilter} from '../lib/filter/filter';

describe('Filter', () =>
{
    it('can navigate to nested properties', () =>
    {
        const filter = createFilter('', 'a.b', '==', 'x');
        const obj = {
            a: {
                b: 'x'
            }
        };

        expect(testFilter(obj, filter)).toBe(true);
    });

    it('handles inexact comparison of numeric string and integer', () =>
    {
        const filter = createFilter('', 'val', '<', '2');
        const obj = {
            val: 100
        };

        expect(testFilter(obj, filter)).toBe(false);
    });
    it('throws if non-numeric string is compared inexactly with integer', () =>
    {
        const filter = createFilter('', 'val', '<', '2');
        const obj = {
            val: 'asd'
        };

        expect(() => {
            testFilter(obj, filter);
        }).toThrow(BadValueFilteredError);
    });
    it('handles exact comparison of string and integer', () =>
    {
        const filter = createFilter('', 'val', '==', '2');
        const obj = {
            val: 2
        };

        expect(testFilter(obj, filter)).toBe(true);
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
        it(`evaluates ${data.left} ${data.operator} ${data.right} is ${data.result} correctly`, () =>
        {
            const filter = createFilter('', 'val', data.operator, data.right);
            const obj = {
                val: data.left
            };

            expect(testFilter(obj, filter)).toBe(data.result);
        });
    }
});
