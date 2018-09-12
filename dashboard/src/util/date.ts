import {Moment} from 'moment';

export function compareDate(a: Moment, b: Moment): -1 | 1
{
    const before = !a.isAfter(b);
    return before ? -1 : 1;
}
