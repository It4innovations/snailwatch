import {chain, reduce, uniq} from 'ramda';

export function getAllKeys<T>(data: T, prefix: string = ''): string[]
{
    const keys = Object.keys(data);
    return chain(k => {
        const id = prefix === '' ? k : `${prefix}.${k}`;
        if (data[k] instanceof Object)
        {
            return getAllKeys(data[k], id);
        }
        else return [id];
    }, keys);
}

export function getAllKeysMerged<T>(data: T[], reduceObj: (t: T) => {}): string[]
{
    return reduce((acc, obj) => {
        const keys = getAllKeys(reduceObj(obj));
        return uniq(acc.concat(keys));
    }, [], data);
}
