import actionCreatorFactory from 'typescript-fsa';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';

const actionCreator = actionCreatorFactory('chart-state');

export const setChartXAxisAction = actionCreator<string>('set-x-axis');
export const updateSelectedViewsAction = actionCreator<string[]>('update');

export interface ReloadDatasetsParams
{
    rangeFilter: RangeFilter;
}
export const reloadViewMeasurementsAction = actionCreator.async<ReloadDatasetsParams, View[]>('reload');

export interface SelectChartViewParams
{
    view: View;
    xAxis: string;
}
export const selectChartViewAction = actionCreator<SelectChartViewParams>('select-view-from-grid-chart');

export interface SelectViewParams
{
    viewId: string;
}
export const selectViewAction = actionCreator<SelectViewParams>('select-view');
