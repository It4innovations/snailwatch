import {isMoment, default as moment, Moment} from 'moment';
import {isArray, isObject, isString} from 'util';
import {map} from 'ramda';

export function compareDate(a: Moment, b: Moment): number
{
    const before = !a.isAfter(b);
    return before ? -1 : 1;
}
export function serializeDates(obj: {}): {}
{
    if (isMoment(obj))
    {
        return (obj as {} as Moment).toISOString();
    }

    if (isArray(obj) || isObject(obj))
    {
        return map(serializeDates, obj);
    }

    return obj;
}
export function deserializeDates(obj: {}): {}
{
    if (isString(obj) && obj.match(/^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/))
    {
        return moment(obj);
    }

    if (isArray(obj) || isObject(obj))
    {
        return map(deserializeDates, obj);
    }

    return obj;
}
