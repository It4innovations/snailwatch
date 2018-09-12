import {Dictionary, dissoc, uniq, zipObj} from 'ramda';
import {maximum} from './math';

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

export function deleteFromDatabase<T>(database: Database<T>, id: string): Database<T>
{
    return {
        items: dissoc(id, database.items),
        keys: database.keys.filter(k => k !== id)
    };
}

export function getDatabaseItems<T>(database: Database<T>): T[]
{
    return database.keys.map(key => database.items[key]);
}

export function getNextId<T>(objects: T[], accessor: (t: T) => number = t => Number(t['id'])): string
{
    return (maximum(objects, 0, accessor) + 1).toString();
}
