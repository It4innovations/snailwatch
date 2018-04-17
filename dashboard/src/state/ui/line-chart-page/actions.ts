import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';
import {Project} from '../../../lib/project/project';
import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {LineChartDataset} from '../../../components/visualisation/chart/line-chart/line-chart-dataset';

const actionCreator = actionCreatorFactory('line-chart-page');

export const setLineChartXAxisAction = actionCreator<string>('set-x-axis');

export interface AddDatasetParams
{
    user: User;
    project: Project;
    rangeFilter: RangeFilter;
}
export const addLineChartDatasetAction = actionCreator.async<AddDatasetParams, LineChartDataset>('add');
export const deleteLineChartDatasetAction = actionCreator<LineChartDataset>('delete');

export interface UpdateDatasetParams
{
    user: User;
    project: Project;
    rangeFilter: RangeFilter;
    dataset: LineChartDataset;
    selectionId: string;
    yAxis: string;
}
export const updateLineChartDatasetAction = actionCreator.async<UpdateDatasetParams, LineChartDataset>('update');

export interface ReloadDatasetsParams
{
    user: User;
    project: Project;
    rangeFilter: RangeFilter;
}
export const reloadDatasetsAction = actionCreator.async<ReloadDatasetsParams, LineChartDataset[]>('reload');
