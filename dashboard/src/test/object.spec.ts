import {getAllKeys, getAllKeysMerged} from '../util/object';

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
