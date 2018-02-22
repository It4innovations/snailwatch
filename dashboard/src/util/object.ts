import {chain, lensPath, reduce, uniq, view, contains} from 'ramda';

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

export function getValuesWithPath<T>(data: T[], path: string): string[]
{
    const allowed = ['boolean', 'number', 'string'];

    return reduce((acc, obj) => {
        const value = getValueWithPath(obj, path);
        if (contains(typeof value, allowed))
        {
            return uniq(acc.concat([value]));
        }

        return acc;
    }, [], data);
}

export function getValueWithPath<T>(data: T, path: string): string | undefined
{
    const lens = lensPath(path.split('.'));
    return view<T, string>(lens, data);
}
