import {Moment} from 'moment';

export interface RangeFilter
{
    from: Moment;
    to: Moment;
    entryCount: number;
    useDateFilter: boolean;
}
