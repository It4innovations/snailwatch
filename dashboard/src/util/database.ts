import {Dictionary, zipObj, uniq} from 'ramda';

export interface Database<T>
{
    items: Dictionary<T>;
    keys: string[];
}

export function createDatabase<T>(items: T[] = [], keyFn: (t: T) => string = (t: T) => t['id']): Database<T>
{
    const keys = items.map(keyFn);

    return {
        items: zipObj(keys, items),
        keys
    };
}

export function mergeDatabase<T>(database: Database<T>, items: T[], keyFn: (t: T) => string = (t: T) => t['id'])
    : Database<T>
{
    const keys = items.map(keyFn);
    const dict = zipObj(keys, items);

    return {
        items: {...database.items, ...dict},
        keys: uniq([...database.keys, ...keys])
    };
}

export function getDatabaseItems<T>(database: Database<T>): T[]
{
    return database.keys.map(key => database.items[key]);
}
