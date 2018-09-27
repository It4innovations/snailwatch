import {routerReducer, RouterState} from 'react-router-redux';
import {Reducer} from 'redux';
import {createMigrate, createTransform, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
    deserializeDates,
    ignoreVolatileAttributes,
    serializeDates,
    serializeMeasurements,
    serializeRequests
} from '../../util/serialization';
import {sessionReducer, SessionState} from '../session/reducers';
import {migrations} from './migrations';

export interface AppState
{
    session: SessionState;
    router: RouterState;
}

const sessionPersist = {
    key: 'session',
    version: 0,
    storage,
    migrate: createMigrate(migrations),
    transforms: [
        // do not persist range filters and init variables
        createTransform(
            null,
            ignoreVolatileAttributes
        ),
        // serialize Moments to strings and vice-versa
        createTransform(
            serializeDates,
            deserializeDates
        ),
        // reset requests during serialization
        createTransform(
            serializeRequests,
            null
        ),
        // do not serialize measurements, they might take a lot of space
        createTransform(
            serializeMeasurements,
            null
        )
    ]
};

export const rootReducer: {[K in keyof AppState]: Reducer<{}>} = {
    session: persistReducer(sessionPersist, sessionReducer),
    router: routerReducer
};
