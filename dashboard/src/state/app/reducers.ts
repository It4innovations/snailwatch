import {routerReducer, RouterState} from 'react-router-redux';
import {Reducer} from 'redux';
import {createTransform, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {deserializeDates, deserializeRangeFilter, serializeDates, serializeRequests} from '../../util/serialization';
import {sessionReducer, SessionState} from '../session/reducers';

export interface AppState
{
    session: SessionState;
    router: RouterState;
}

const sessionPersist = {
    key: 'session',
    storage,
    transforms: [createTransform(
        null,
        deserializeRangeFilter
    ), createTransform(
        serializeDates,
        deserializeDates
    ), createTransform(
        serializeRequests,
        null
    )]
};

export const rootReducer: {[K in keyof AppState]: Reducer<{}>} = {
    session: persistReducer(sessionPersist, sessionReducer),
    router: routerReducer
};
