import {isMoment, default as moment, Moment} from 'moment';
import {isArray, isObject, isString} from 'util';
import {map} from 'ramda';

const SERIALIZATION_FORMAT = 'DD.MM.YYYYTHH:mm:ss';

export function compareDate(a: Moment, b: Moment): number
{
    const before = !a.isAfter(b);
    return before ? -1 : 1;
}
export function serializeDates(obj: {}): {}
{
    if (isMoment(obj))
    {
        return (obj as {} as Moment).format(SERIALIZATION_FORMAT);
    }

    if (isArray(obj) || isObject(obj))
    {
        return map(serializeDates, obj);
    }

    return obj;
}
export function deserializeDates(obj: {}): {}
{
    if (isString(obj) && obj.match(/^\d{2}\.\d{2}\.\d{4}T\d{2}:\d{2}:\d{2}$/))
    {
        return moment(obj, SERIALIZATION_FORMAT);
    }

    if (isArray(obj) || isObject(obj))
    {
        return map(deserializeDates, obj);
    }

    return obj;
}
