import actionCreatorFactory from 'typescript-fsa';
import {Project} from '../../../lib/project/project';
import {createCrudActions} from '../../../util/crud';

const actionCreator = actionCreatorFactory('project');

export interface LoadProjectsParams
{
    force: boolean;
}
export const ProjectActions = createCrudActions<Project, LoadProjectsParams>('project');

export const loadProject = actionCreator.async<string, Project>('load-project');

export const selectProject = actionCreator.async<string, Project>('select');
export const deselectProject = actionCreator('deselect');

export const loadUploadToken = actionCreator.async<{}, string>('load-upload-token');
export const regenerateUploadToken = actionCreator.async<{}, string>('generate-upload-token');
