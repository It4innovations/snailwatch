import {Action} from 'redux';
import {Epic} from 'redux-observable';
import {ServiceContainer} from './di';
import {AppState} from './reducers';

export type AppEpic = Epic<Action, Action, AppState, ServiceContainer>;
