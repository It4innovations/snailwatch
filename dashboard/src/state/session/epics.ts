import {combineEpics} from 'redux-observable';
import {userEpics} from './user/epics';
import {projectEpics} from './project/epics';
import {selectionEpics} from './selection/epics';
import {barChartEpics} from './views/bar-chart-page/epics';
import {lineChartEpics} from './views/line-chart-page/epics';
import {measurementsEpics} from './views/measurements-page/epics';
import {gridChartEpics} from './views/grid-chart-page/epics';

export const sessionEpics = combineEpics(
    userEpics,
    selectionEpics,
    projectEpics,
    barChartEpics,
    lineChartEpics,
    gridChartEpics,
    measurementsEpics
);
