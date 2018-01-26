import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';

const actionCreator = actionCreatorFactory('project');

export interface LoadProjectParams
{
    user: User;
    force: boolean;
}
export const loadProjects = actionCreator.async<LoadProjectParams, Project[]>('load');

export interface CreateProjectParams
{
    user: User;
    name: string;
}
export const createProject = actionCreator.async<CreateProjectParams, boolean>('create');
