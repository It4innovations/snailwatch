import {BarChartPageState, barChartReducer} from './bar-chart-page/reducer';

export interface UIState
{
    barChartPage: BarChartPageState;
}

export const uiReducer = {
    barChartPage: barChartReducer
};
