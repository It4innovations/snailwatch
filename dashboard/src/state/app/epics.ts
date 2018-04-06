import {combineEpics} from 'redux-observable';
import {userEpics} from '../user/epics';
import {projectEpics} from '../project/epics';
import {measurementEpics} from '../measurement/epics';
import {viewEpics} from '../selection/epics';
import {AppEpic} from './app-epic';
import {uiEpics} from '../ui/epics';

export const rootEpic: AppEpic = combineEpics(
    userEpics,
    projectEpics,
    measurementEpics,
    viewEpics,
    uiEpics
) as AppEpic;
