import createHistory from 'history/createBrowserHistory';
import {routerMiddleware, routerReducer} from 'react-router-redux';
import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import {createEpicMiddleware} from 'redux-observable';
import thunk from 'redux-thunk';
import {rootEpic} from './epics';
import {reducers} from './reducers';
import url from 'url';
import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import {RestClient} from '../../lib/api/rest-client';

export const history = createHistory({
    basename: url.parse(process.env.PUBLIC_URL || 'http://localhost').pathname
});

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const router = routerMiddleware(history);
const epic = createEpicMiddleware(rootEpic, {
    dependencies: {
        client: new RestClient('http://localhost:5000')
    }
});
const logger = createLogger();
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

export const store = createStore(
    rootReducer,
    composeEnhancers(applyMiddleware(router, epic, thunk, logger))
);
export const persistor = persistStore(store);
