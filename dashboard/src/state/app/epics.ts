import {combineEpics} from 'redux-observable';
import {userEpics} from '../user/epics';
import {projectEpics} from '../project/epics';
import {measurementEpics} from '../measurement/epics';
import {viewEpics} from '../view/epics';
import {AppEpic} from './app-epic';

export const rootEpic: AppEpic = combineEpics(
    userEpics,
    projectEpics,
    measurementEpics,
    viewEpics
) as AppEpic;
