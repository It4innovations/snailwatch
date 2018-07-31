import actionCreatorFactory from 'typescript-fsa';
import {LineChartDataset} from '../../../../components/charts/chart/line-chart/line-chart-dataset';

const actionCreator = actionCreatorFactory('grid-chart-page');

export const setGridChartXAxisAction = actionCreator<string>('set-x-axis');
export const setGridChartYAxisAction = actionCreator<string>('set-y-axis');

export const loadGridChartDatasetsAction = actionCreator.async<{}, LineChartDataset[]>('load');
