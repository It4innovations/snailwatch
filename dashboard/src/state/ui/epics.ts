import {combineEpics} from 'redux-observable';
import {barChartEpics} from './bar-chart-page/epics';
import {lineChartEpics} from './line-chart-page/epics';

export const uiEpics = combineEpics(
    barChartEpics,
    lineChartEpics
);
