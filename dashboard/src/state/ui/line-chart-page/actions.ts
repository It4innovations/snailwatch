import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';
import {Project} from '../../../lib/project/project';
import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {LineChartDataset} from '../../../components/visualisation/line-chart/line-chart-dataset';
import {Selection} from '../../../lib/measurement/selection/selection';

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
    selection: Selection | null;
    yAxis: string;
}
export const updateLineChartDatasetAction = actionCreator.async<UpdateDatasetParams, LineChartDataset>('update');
