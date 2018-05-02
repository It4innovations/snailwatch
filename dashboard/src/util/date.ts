import {Moment} from 'moment';

export function compareDate(a: Moment, b: Moment): number
{
    const before = !a.isAfter(b);
    return before ? -1 : 1;
}
