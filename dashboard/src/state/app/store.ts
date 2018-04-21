import createHistory from 'history/createBrowserHistory';
import {routerMiddleware, routerReducer} from 'react-router-redux';
import {Action, applyMiddleware, combineReducers, compose, createStore, Reducer} from 'redux';
import {createLogger} from 'redux-logger';
import {createEpicMiddleware} from 'redux-observable';
import thunk from 'redux-thunk';
import {rootEpic} from './epics';
import {AppState, reducers} from './reducers';
import {persistReducer, persistStore, createTransform} from 'redux-persist';
import reduxCatch from 'redux-catch';
import Raven from 'raven-js';
import {RestClient} from '../../lib/api/rest-client';
import {API_SERVER, URL_PREFIX} from '../../configuration';
import storage from 'redux-persist/lib/storage';
import {deserializeDates, serializeDates} from '../../util/date';

function errorHandler(error: Error, getState: () => AppState, action: Action)
{
    Raven.setExtraContext({
        state: getState() as {},
        action
    });
    Raven.captureException(error);
}

export const history = createHistory({
    basename: URL_PREFIX
});

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const router = routerMiddleware(history);
const epic = createEpicMiddleware(rootEpic, {
    dependencies: {
        client: new RestClient(API_SERVER)
    }
});

const sessionPersist = {
    key: 'session',
    storage,
    transforms: [createTransform(
        serializeDates,
        deserializeDates
    )]
};

const rootReducer: {[K in keyof AppState]: Reducer<{}>} = {
    ...reducers,
    session: persistReducer(sessionPersist, reducers.session),
    router: routerReducer
};
const middleware = [
    router,
    epic,
    thunk
];

if (process.env.NODE_ENV === 'production')
{
    Raven
        .config('https://7819c60749c84e27a09d1cdc8bcc276e@sentry.io/278022')
        .install();
    middleware.push(reduxCatch(errorHandler));
}
else middleware.push(createLogger());

export const store = createStore(
    combineReducers(rootReducer),
    composeEnhancers(applyMiddleware(...middleware))
);
export const persistor = persistStore(store);
