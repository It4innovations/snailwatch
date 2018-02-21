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
    sort: string;
    page: number;
    reload: boolean;
}
export const loadMeasurements = actionCreator.async<LoadMeasurementParams, FetchResult<Measurement>>('load');
export function createLoadMeasurementParams(params: Partial<LoadMeasurementParams>)
{
    return {
        user: params.user,
        project: params.project,
        filters: params.filters || [],
        sort: params.sort === undefined ? '-timestamp' : params.sort,
        reload: params.reload === undefined ? true : params.reload,
        page: params.page === undefined ? null : params.page
    };
}

export interface DeleteMeasurementParams
{
    user: User;
    measurement: Measurement;
}
export const deleteMeasurement = actionCreator.async<DeleteMeasurementParams, boolean>('delete');

export const clearMeasurements = actionCreator('clear');
