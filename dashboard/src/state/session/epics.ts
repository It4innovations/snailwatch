import {combineEpics} from 'redux-observable';
import {chartEpics} from './pages/chart-page/epics';
import {gridChartPageEpics} from './pages/grid-chart-page/epics';
import {measurementsEpics} from './pages/measurements-page/epics';
import {projectEpics} from './project/epics';
import {selectionEpics} from './selection/epics';
import {userEpics} from './user/epics';
import {analysisEpics} from './view/epics';

export const sessionEpics = combineEpics(
    userEpics,
    analysisEpics,
    selectionEpics,
    projectEpics,
    chartEpics,
    gridChartPageEpics,
    measurementsEpics
);
