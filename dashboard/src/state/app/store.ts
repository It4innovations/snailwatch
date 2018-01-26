import createHistory from 'history/createBrowserHistory';
import {routerMiddleware, routerReducer} from 'react-router-redux';
import {Action, applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import {createEpicMiddleware} from 'redux-observable';
import thunk from 'redux-thunk';
import {rootEpic} from './epics';
import {AppState, reducers} from './reducers';
import url from 'url';
import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import reduxCatch from 'redux-catch';
import Raven from 'raven-js';
import {RestClient} from '../../lib/api/rest-client';
import configuration from '../../configuration.json';

Raven
    .config('https://7819c60749c84e27a09d1cdc8bcc276e@sentry.io/278022')
    .install();
function errorHandler(error: Error, getState: () => AppState, action: Action)
{
    Raven.setExtraContext({
        state: getState() as {},
        action
    });
    Raven.captureException(error);
}

export const history = createHistory({
    basename: url.parse(process.env.PUBLIC_URL || 'http://localhost').pathname
});

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const router = routerMiddleware(history);
const epic = createEpicMiddleware(rootEpic, {
    dependencies: {
        client: new RestClient(configuration.apiServer)
    }
});
const persistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user']
};
const rootReducer = combineReducers({
    ...reducers,
    user: persistReducer(persistConfig, reducers.user),
    router: routerReducer
});

const middleware = [router,
    epic,
    thunk
];
if (process.env.NODE_ENV === 'production')
{
    middleware.push(reduxCatch(errorHandler));
}
else middleware.push(createLogger());

export const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(...middleware))
);
export const persistor = persistStore(store);
