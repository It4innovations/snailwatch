import {isArray, isObject, isString} from 'util';
import {isMoment, Moment, default as moment} from 'moment';
import {Functor, map} from 'ramda';
import {createRequest, isRequest} from './request';

const SERIALIZATION_FORMAT = 'DD.MM.YYYYTHH:mm:ss';

function traverse(obj: {},
                  predicate: (obj: {}) => boolean,
                  transform: (obj: {}) => {}): {}
{
    if (predicate(obj))
    {
        return transform(obj);
    }

    if (isArray(obj) || isObject(obj))
    {
        return map(o => traverse(o, predicate, transform), obj as Functor<{}>);
    }

    return obj;
}

export function serializeDates(obj: {}): {}
{
    return traverse(obj,
            o => isMoment(o),
            o => (o as {} as Moment).format(SERIALIZATION_FORMAT)
    );
}
export function deserializeDates(obj: {}): {}
{
    return traverse(obj,
            o => isString(o) && o.match(/^\d{2}\.\d{2}\.\d{4}T\d{2}:\d{2}:\d{2}$/) !== null,
            o => moment(o, SERIALIZATION_FORMAT)
    );
}

export function serializeRequests(obj: {}): {}
{
    return traverse(obj,
        o => isRequest(o),
        o => createRequest()
    );
}
