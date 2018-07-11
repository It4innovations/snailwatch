import actionCreatorFactory from 'typescript-fsa';
import {Project} from '../../../lib/project/project';

const actionCreator = actionCreatorFactory('project');

export interface LoadProjectsParams
{
    force: boolean;
}
export const loadProjects = actionCreator.async<LoadProjectsParams, Project[]>('load-projects');
export const loadProject = actionCreator.async<string, Project>('load-project');
export const createProject = actionCreator.async<string, boolean>('create');

export const selectProject = actionCreator.async<string, Project>('select');
export const deselectProject = actionCreator('deselect');

export const loadUploadToken = actionCreator.async<{}, string>('load-upload-token');
export const regenerateUploadToken = actionCreator.async<{}, string>('generate-upload-token');
