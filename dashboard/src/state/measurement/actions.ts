import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';
import {Measurement} from '../../lib/measurement/measurement';
import {Filter} from '../../lib/view/filter';
import {FetchResult} from '../../lib/api/snail-client';

const actionCreator = actionCreatorFactory('measurement');

export interface LoadMeasurementParams
{
    user: User;
    project: Project;
    filters: Filter[];
    reload: boolean;
}

export const loadMeasurements = actionCreator.async<LoadMeasurementParams, FetchResult<Measurement>>('load');

export const clearMeasurements = actionCreator('clear');
