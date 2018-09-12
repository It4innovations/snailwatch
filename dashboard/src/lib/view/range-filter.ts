import {Moment} from 'moment';
import moment from 'moment';

export interface RangeFilter
{
    from: Moment;
    to: Moment;
    entryCount: number;
    useDateFilter: boolean;
}

export function createEntryRangeFilter(entryCount: number): RangeFilter
{
    return {
        from: moment(),
        to: moment(),
        entryCount,
        useDateFilter: false
    };
}
