import {routerReducer, RouterState} from 'react-router-redux';
import {SessionState, sessionReducer} from '../session/reducers';
import {createTransform, persistReducer} from 'redux-persist';
import {deserializeDates, serializeDates, deserializeRangeFilter, serializeRequests} from '../../util/serialization';
import storage from 'redux-persist/lib/storage';
import {Reducer} from 'redux';

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
