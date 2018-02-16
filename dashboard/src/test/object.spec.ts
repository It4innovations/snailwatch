import {getAllKeysRecursive} from '../util/object';

describe('getAllKeysRecursive', () =>
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

        const keys = getAllKeysRecursive(obj);
        expect(keys).toEqual([
            'data',
            'str',
            'inner.asd',
            'inner.inner2.key'
        ]);
    });
});
