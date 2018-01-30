import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';
import {Measurement} from '../../lib/measurement/measurement';

const actionCreator = actionCreatorFactory('measurement');

export interface LoadMeasurementParams
{
    user: User;
    project: Project;
}

export const loadMeasurements = actionCreator.async<LoadMeasurementParams, Measurement[]>('load');

export const clearMeasurements = actionCreator('clear');
