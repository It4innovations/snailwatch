import {contains, lensPath, reduce, uniq, view} from 'ramda';

// https://stackoverflow.com/a/5878101/1107768
export function isPlainObject(obj: {})
{
    return obj !== null && typeof obj === 'object' && obj.constructor === Object;
}

export function getAllKeysSet<T>(data: T, set: Set<string>, prefix: string = '')
{
    const keys = Object.keys(data);
    for (const k of keys)
    {
        const id = prefix === '' ? k : `${prefix}.${k}`;
        if (isPlainObject(data[k]))
        {
            getAllKeysSet(data[k], set, id);
        }
        else set.add(id);
    }
}

export function getAllKeysMerged<T>(data: T[], reduceObj: (t: T) => {}): string[]
{
    const set = new Set<string>();
    for (const item of data)
    {
        getAllKeysSet(reduceObj(item), set);
    }
    return Array.from(set);
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

// https://gist.github.com/albertorestifo/83877c3e4c81066a592a47c4dcf6753b
export function debugDiffObjects(prev: {}, current: {})
{
    const now = Object.keys(current);
    const added = now.filter(key => {
        if (prev[key] === undefined) return true;
        const val = current[key];
        if (prev[key] !== val)
        {
            console.log(`${key}`);
        }
        return false;
    });
    added.forEach(key => console.log(`${key}
          + ${JSON.stringify(now[key])}`));
}
