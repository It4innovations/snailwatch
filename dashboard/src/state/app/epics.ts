import {combineEpics} from 'redux-observable';
import {AppEpic} from './app-epic';
import {sessionEpics} from '../session/epics';

export const rootEpic: AppEpic = combineEpics(
    sessionEpics
) as AppEpic;
