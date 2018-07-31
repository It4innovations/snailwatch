import actionCreatorFactory from 'typescript-fsa';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {LineChartDataset} from '../../../../components/visualisation/chart/line-chart/line-chart-dataset';

const actionCreator = actionCreatorFactory('line-chart-page');

export const setLineChartXAxisAction = actionCreator<string>('set-x-axis');

export interface AddDatasetParams
{
    rangeFilter: RangeFilter;
}
export const addLineChartDatasetAction = actionCreator.async<AddDatasetParams, LineChartDataset>('add');
export const deleteLineChartDatasetAction = actionCreator<LineChartDataset>('delete');

export interface UpdateDatasetParams
{
    rangeFilter: RangeFilter;
    dataset: LineChartDataset;
    selectionId: string;
    yAxis: string;
}
export const updateLineChartDatasetAction = actionCreator.async<UpdateDatasetParams, LineChartDataset>('update');

export interface ReloadDatasetsParams
{
    rangeFilter: RangeFilter;
}
export const reloadLineChartDatasetsAction = actionCreator.async<ReloadDatasetsParams, LineChartDataset[]>('reload');

export interface SelectDatasetParams
{
    dataset: LineChartDataset;
    xAxis: string;
}
export const selectLineChartDatasetAction = actionCreator<SelectDatasetParams>('select');
