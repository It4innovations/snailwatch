import actionCreatorFactory from 'typescript-fsa';
import {LineChartSettings} from '../../../../components/charts/chart/line-chart/line-chart-settings';
import {XAxisSettings} from '../../../../components/charts/chart/x-axis-settings';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';

const actionCreator = actionCreatorFactory('chart-state');

export const updateChartXAxisSettingsAction = actionCreator<XAxisSettings>('set-x-axis-settings');
export const updateSelectedViewsAction = actionCreator<string[]>('update-selected-views');

export interface ReloadViewMeasurementsParams
{
    rangeFilter: RangeFilter;
    views: string[];     // views that should be loaded
}
export const reloadViewMeasurementsAction = actionCreator.async<
    ReloadViewMeasurementsParams, View[]>('reload-datasets');

// sets all views as active, downloads datasets for them
export const setAllViewsActiveAction = actionCreator('set-all-views-active');

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
