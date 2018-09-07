import actionCreatorFactory from 'typescript-fsa';
import {Project} from '../../../lib/project/project';
import {createCrudActions} from '../../../util/crud';

const actionCreator = actionCreatorFactory('project');

export interface LoadProjectsParams
{
    force: boolean;
}
export const ProjectActions = createCrudActions<Project, LoadProjectsParams>('project');

export const selectProject = actionCreator.async<string, string>('select');
export const deselectProject = actionCreator('deselect');

export interface RegenerateUploadTokenParams
{
    project: string;
}
export const regenerateUploadToken = actionCreator.async<RegenerateUploadTokenParams, string>('generate-upload-token');
