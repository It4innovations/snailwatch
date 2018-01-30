import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AppState} from '../app/reducers';
import {Project} from '../../lib/project/project';
import {createProject, loadProject, loadProjects} from './actions';
import {createRequest, hookRequestActions, Request} from '../../util/request';

export interface ProjectState
{
    projects: Project[];
    loadProjectsRequest: Request;
    loadProjectRequest: Request;
    createProjectRequest: Request;
}

let reducer = reducerWithInitialState<ProjectState>({
    projects: [],
    loadProjectsRequest: createRequest(),
    loadProjectRequest: createRequest(),
    createProjectRequest: createRequest()
});

reducer = hookRequestActions(reducer,
    loadProject,
    (state: ProjectState) => state.loadProjectRequest,
    (state: ProjectState, result) => ({
        projects: [...state.projects.filter(p => p.id !== result.id), result]
    })
);
reducer = hookRequestActions(reducer,
    loadProjects,
    (state: ProjectState) => state.loadProjectsRequest,
    (state: ProjectState, projects) => ({
        projects
    })
);
reducer = hookRequestActions(reducer,
    createProject,
    (state: ProjectState) => state.createProjectRequest
);

export const getProjects = (state: AppState) => state.project.projects;
export const getProjectByName = (projects: Project[], name: string) => projects.find(p => p.name === name) || null;

export const projectReducer = reducer;
