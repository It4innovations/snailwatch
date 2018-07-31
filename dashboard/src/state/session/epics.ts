import {combineEpics} from 'redux-observable';
import {userEpics} from './user/epics';
import {projectEpics} from './project/epics';
import {selectionEpics} from './selection/epics';
import {barChartEpics} from './pages/bar-chart-page/epics';
import {lineChartEpics} from './pages/line-chart-page/epics';
import {measurementsEpics} from './pages/measurements-page/epics';
import {gridChartEpics} from './pages/grid-chart-page/epics';
import {analysisEpics} from './view/epics';

export const sessionEpics = combineEpics(
    userEpics,
    analysisEpics,
    selectionEpics,
    projectEpics,
    barChartEpics,
    lineChartEpics,
    gridChartEpics,
    measurementsEpics
);
