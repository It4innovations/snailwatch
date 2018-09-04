import {without} from 'ramda';

export function toggle<T>(items: T[], item: T)
{
    if (items.indexOf(item) === -1) return [...items, item];
    return without([item], items);
}
