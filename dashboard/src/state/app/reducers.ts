import {routerReducer, RouterState} from 'react-router-redux';
import {Reducer} from 'redux';
import {createTransform, persistReducer, createMigrate, PersistedState} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {
    deserializeDates,
    deserializeRangeFilter,
    serializeDates,
    serializeMeasurements,
    serializeRequests
} from '../../util/serialization';
import {sessionReducer, SessionState} from '../session/reducers';

export interface AppState
{
    session: SessionState;
    router: RouterState;
}

const migrations = {
    0: (state: PersistedState & SessionState) => state
};

const sessionPersist = {
    key: 'session',
    version: 0,
    storage,
    migrate: createMigrate(migrations),
    transforms: [
        createTransform(
            null,
            deserializeRangeFilter
        ),
        createTransform(
            serializeDates,
            deserializeDates
        ),
        createTransform(
            serializeRequests,
            null
        ),
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
