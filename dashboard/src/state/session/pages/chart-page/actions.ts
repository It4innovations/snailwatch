import actionCreatorFactory from 'typescript-fsa';
import {ChartDataset} from '../../../../components/charts/chart/chart-dataset';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';

const actionCreator = actionCreatorFactory('chart-state');

export const setChartXAxisAction = actionCreator<string>('set-x-axis');

export interface AddDatasetParams
{
    rangeFilter: RangeFilter;
    view: string;
}
export const addChartDatasetAction = actionCreator.async<AddDatasetParams, ChartDataset>('add');
export const deleteChartDatasetAction = actionCreator<ChartDataset>('delete');

export interface UpdateDatasetParams
{
    rangeFilter: RangeFilter;
    dataset: ChartDataset;
    view: string;
}
export const updateChartDatasetAction = actionCreator.async<UpdateDatasetParams, ChartDataset>('update');

export interface ReloadDatasetsParams
{
    rangeFilter: RangeFilter;
}
export const reloadChartDatasetsAction = actionCreator.async<ReloadDatasetsParams, ChartDataset[]>('reload');

export interface SelectChartViewParams
{
    view: View;
    xAxis: string;
}
export const selectChartViewAction = actionCreator<SelectChartViewParams>('select');
