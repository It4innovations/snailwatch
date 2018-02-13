import {Epic} from 'redux-observable';
import {AppState} from './reducers';
import {ServiceContainer} from './di';
import {Action} from 'redux';

export type AppEpic = Epic<Action, AppState, ServiceContainer>;
