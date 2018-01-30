import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';

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

export const clearProjects = actionCreator('clear');
