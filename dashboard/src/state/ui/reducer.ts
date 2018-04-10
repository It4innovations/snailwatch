import {BarChartPageState, barChartReducer} from './bar-chart-page/reducer';
import {LineChartPageState, lineChartReducer} from './line-chart-page/reducer';

export interface UIState
{
    barChartPage: BarChartPageState;
    lineChartPage: LineChartPageState;
}

export const uiReducer = {
    barChartPage: barChartReducer,
    lineChartPage: lineChartReducer
};
