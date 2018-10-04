import {default as moment, isMoment, Moment} from 'moment';
import {Functor, lensPath, map, set} from 'ramda';
import {isArray, isObject, isString} from 'util';
import {Measurement} from '../lib/measurement/measurement';
import {initialState as PageInitialState} from '../state/session/pages/reducers';
import {initialState as ProjectInitialState} from '../state/session/project/reducers';
import {isPlainObject} from './object';
import {createRequest, isRequest} from './request';

const SERIALIZATION_FORMAT = 'DD.MM.YYYYTHH:mm:ss';

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

export function ignoreVolatileAttributes(obj: {}, key: string): {}
{
    if (key === 'pages')
    {
        const path = lensPath(['global', 'rangeFilter']);
        return set(path, {...PageInitialState.rangeFilter}, obj);
    }
    else if (key === 'project')
    {
        const path = lensPath(['projectInitialized']);
        return set(path, ProjectInitialState.projectInitialized, obj);
    }
    return obj;
}

export function serializeMeasurements(obj: {}): {}
{
    return traverse(obj,
        o => isMeasurementArray(o as Measurement[]),
        () => []
    );
}

function traverse(obj: {},
                  predicate: (obj: {}) => boolean,
                  transform: (obj: {}) => {}): {}
{
    if (predicate(obj))
    {
        return transform(obj);
    }

    if (isArray(obj) || isPlainObject(obj))
    {
        return map(o => traverse(o, predicate, transform), obj as Functor<{}>);
    }

    return obj;
}

function isMeasurement(obj: {}): boolean
{
    return  isObject(obj) &&
            obj.hasOwnProperty('id') &&
            obj.hasOwnProperty('timestamp') &&
            obj.hasOwnProperty('benchmark') &&
            obj.hasOwnProperty('environment') &&
            obj.hasOwnProperty('result');
}
function isMeasurementArray(obj: Measurement[]): boolean
{
    return  isArray(obj) &&
            obj.length > 0 &&
            isMeasurement(obj[0]);
}
