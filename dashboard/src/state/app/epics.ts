import {combineEpics} from 'redux-observable';
import {sessionEpics} from '../session/epics';
import {AppEpic} from './app-epic';

export const rootEpic: AppEpic = combineEpics(
    sessionEpics
);
