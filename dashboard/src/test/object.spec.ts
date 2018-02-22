import {getAllKeys, getAllKeysMerged, getValuesWithPath, getValueWithPath} from '../util/object';

describe('getAllKeys', () =>
{
    it('Returns inner keys', () =>
    {
        const obj = {
            data: 1,
            str: 'hello',
            inner: {
                asd: '5',
                inner2: {
                    key: 'value'
                }
            }
        };

        const keys = getAllKeys(obj);
        expect(keys).toEqual([
            'data',
            'str',
            'inner.asd',
            'inner.inner2.key'
        ]);
    });
});

describe('getAllKeysMerged', () =>
{
    it('Combines keys from multiple objects', () =>
    {
        const objs = [{
            data: 1,
            str: 'hello',
            inner: {
                asd: '5',
                inner2: {
                    key: 'value'
                }
            }
        }, {
            str: 'hello',
            inner: {
                asd: '5',
                inner3: {
                    value: ''
                }
            },
            test: 'test'
        }];

        const keys = getAllKeysMerged(objs, obj => obj);
        expect(keys).toEqual([
            'data',
            'str',
            'inner.asd',
            'inner.inner2.key',
            'inner.inner3.value',
            'test'
        ]);
    });
});

describe('getValueWithPath', () => {
    it('returns nested items', () => {
        const obj = {
            x: {
                a: 5
            }
        };

        expect(getValueWithPath(obj, 'x.a')).toEqual(5);
    });
    it('returns undefined on non-existing path', () => {
        const obj = {
            x: {
                a: 5
            }
        };

        expect(getValueWithPath(obj, 'x.b')).toEqual(undefined);
    });
});

describe('getValuesWithPath', () => {
    it('combines values of multiple objects', () => {
        const objs = [{
                a: 5
            }, {
                a: 6
            }, {
                a: 'x'
            }
        ];

        expect(getValuesWithPath(objs, 'a')).toEqual([5, 6, 'x']);
    });
    it('ignores complex types', () => {
        const objs = [{
                a: 5
            }, {
                a: { key: 'value' }
            }, {
                a: 'x',
                b: 'y'
            }, {
                a: [1, 2]
            }
        ];

        expect(getValuesWithPath(objs, 'a')).toEqual([5, 'x']);
    });
});

