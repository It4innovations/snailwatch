import {chain} from 'ramda';

export function getAllKeysRecursive(data: object, prefix: string = ''): string[]
{
    const keys = Object.keys(data);
    return chain(k => {
        const id = prefix === '' ? k : `${prefix}.${k}`;
        if (data[k] instanceof Object)
        {
            return getAllKeysRecursive(data[k], id);
        }
        else return [id];
    }, keys);
}
