import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';
import {Project} from '../../../lib/project/project';
import {Measurement} from '../../../lib/measurement/measurement';
import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {Selection} from '../../../lib/measurement/selection/selection';

const actionCreator = actionCreatorFactory('bar-chart-page');

export interface LoadMeasurementParams
{
    user: User;
    project: Project;
    rangeFilter: RangeFilter;
    selection: Selection | null;
}
export const loadBarChartMeasurementsAction =
    actionCreator.async<LoadMeasurementParams, Measurement[]>('load');

export const setBarChartXAxisAction = actionCreator<string>('set-x-axis');
export const setBarChartYAxesAction = actionCreator<string[]>('set-y-axes');
export const setBarChartSelection = actionCreator<string>('set-selection');