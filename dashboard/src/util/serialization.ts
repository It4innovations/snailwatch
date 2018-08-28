import {default as moment, isMoment, Moment} from 'moment';
import {Functor, lensPath, map, set} from 'ramda';
import {isArray, isObject, isString} from 'util';
import {initialState, PagesState} from '../state/session/pages/reducers';
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
        () => createRequest()
    );
}

export function deserializeRangeFilter(obj: PagesState, key: string): {}
{
    if (key === 'pages')
    {
        const path = lensPath(['global', 'rangeFilter']);
        return set(path, {...initialState.rangeFilter}, obj);
    }
    return obj;
}
