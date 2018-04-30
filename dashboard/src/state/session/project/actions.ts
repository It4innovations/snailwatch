import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../../lib/user/user';
import {Project} from '../../../lib/project/project';

const actionCreator = actionCreatorFactory('project');

export interface LoadProjectsParams
{
    user: User;
    force: boolean;
}
export const loadProjects = actionCreator.async<LoadProjectsParams, Project[]>('load-projects');

export interface LoadProjectParams
{
    user: User;
    name: string;
}
export const loadProject = actionCreator.async<LoadProjectParams, Project>('load-project');

export interface CreateProjectParams
{
    user: User;
    name: string;
}
export const createProject = actionCreator.async<CreateProjectParams, boolean>('create');

export const selectProject = actionCreator.async<string, Project>('select');
export const deselectProject = actionCreator('deselect');

export interface UploadTokenParams
{
    user: User;
    project: Project;
}
export const loadUploadToken = actionCreator.async<UploadTokenParams, string>('load-upload-token');
export const regenerateUploadToken = actionCreator.async<UploadTokenParams, string>('generate-upload-token');