import createHistory from 'history/createBrowserHistory';
import {routerMiddleware, routerReducer} from 'react-router-redux';
import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import {createEpicMiddleware} from 'redux-observable';
import thunk from 'redux-thunk';
import {rootEpic} from './epics';
import {reducers} from './reducers';
import url from 'url';

export const history = createHistory({
    basename: url.parse(process.env.PUBLIC_URL || 'http://localhost').pathname
});

const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || compose;
const router = routerMiddleware(history);
const epic = createEpicMiddleware(rootEpic);
const logger = createLogger();

export const store = createStore(
    combineReducers({
        ...reducers,
        router: routerReducer
    }),
    composeEnhancers(applyMiddleware(router, epic, thunk, logger))
);
