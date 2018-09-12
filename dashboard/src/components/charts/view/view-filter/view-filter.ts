import {sort} from 'ramda';
import {View} from '../../../../lib/view/view';
import {compareDate} from '../../../../util/date';

export enum ViewSortMode
{
    Name,
    CreationTime
}

export interface ViewFilter
{
    query: string;
    sortMode: ViewSortMode;
}

export function applyFilter(views: View[], filter: ViewFilter): View[]
{
    const query = filter.query.trim();
    const regex = new RegExp(query, 'i');
    const filtered = views.filter(v => regex.test(v.name));
    const sortFn: (a: View, b: View) => number = filter.sortMode === ViewSortMode.CreationTime ?
        (a, b) => compareDate(a.created, b.created) :
        (a, b) => a.name.localeCompare(b.name);

    return sort(sortFn, filtered);
}
