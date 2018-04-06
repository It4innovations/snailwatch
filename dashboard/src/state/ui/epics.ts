import {combineEpics} from 'redux-observable';
import {barChartEpics} from './bar-chart-page/epics';

export const uiEpics = combineEpics(
    barChartEpics
);
