import createHistory from 'history/createBrowserHistory';
import Raven from 'raven-js';
import {routerMiddleware} from 'react-router-redux';
import {Action, applyMiddleware, combineReducers, compose, createStore} from 'redux';
import reduxCatch from 'redux-catch';
import {createLogger} from 'redux-logger';
import {createEpicMiddleware} from 'redux-observable';
import {persistStore} from 'redux-persist';
import thunk from 'redux-thunk';
import {API_SERVER, URL_PREFIX} from '../../configuration';
import {RestClient} from '../../lib/api/rest-client';
import {rootEpic} from './epics';
import {AppState, rootReducer} from './reducers';

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
const epic = createEpicMiddleware<Action, Action, AppState>({
    dependencies: {
        client: new RestClient(API_SERVER)
    }
});

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

epic.run(rootEpic);
