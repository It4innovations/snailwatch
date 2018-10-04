import actionCreatorFactory from 'typescript-fsa';
import {LineChartSettings} from '../../../../components/charts/chart/line-chart/line-chart-settings';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';

const actionCreator = actionCreatorFactory('chart-state');

export const setChartXAxisAction = actionCreator<string>('set-x-axis');
export const updateSelectedViewsAction = actionCreator<string[]>('update-selected-views');

export const reloadViewMeasurementsAction = actionCreator.async<RangeFilter, View[]>('reload-datasets');

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

export const updateLineChartSettings = actionCreator<LineChartSettings>('update-line-chart-settings');
