import {combineEpics} from 'redux-observable';
import {userEpics} from '../user/epics';
import {projectEpics} from '../project/epics';

export const rootEpic = combineEpics(
    userEpics,
    projectEpics
);
