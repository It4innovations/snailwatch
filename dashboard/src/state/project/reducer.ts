import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AppState} from '../app/reducers';
import {Project} from '../../lib/project/project';
import {clearProjects, createProject, loadProject, loadProjects, selectProject} from './actions';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {createSelector} from 'reselect';

export interface ProjectState
{
    projects: Project[];
    selectedProject: string;
    loadProjectsRequest: Request;
    loadProjectRequest: Request;
    createProjectRequest: Request;
}

let reducer = reducerWithInitialState<ProjectState>({
    projects: [],
    selectedProject: null,
    loadProjectsRequest: createRequest(),
    loadProjectRequest: createRequest(),
    createProjectRequest: createRequest()
})
.case(clearProjects, state => ({
    ...state,
    loadProjectRequest: createRequest(),
    loadProjectsRequest: createRequest(),
    createProjectRequest: createRequest(),
    projects: [],
    selectedProject: null
}))
.case(selectProject, (state, selectedProject) => ({
    ...state,
    selectedProject
}));

reducer = hookRequestActions(reducer,
    loadProject,
    state => state.loadProjectRequest,
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
export const getSelectedProjectName = (state: AppState) => state.project.selectedProject;
export const getProjectByName = (projects: Project[], name: string) => projects.find(p => p.name === name) || null;
export const getSelectedProject = createSelector(getProjects, getSelectedProjectName,
    (projects: Project[], name: string) => name === null ? null : getProjectByName(projects, name)
);

export const projectReducer = reducer;
