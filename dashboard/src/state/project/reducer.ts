import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AppState} from '../app/reducers';
import {Project} from '../../lib/project/project';
import {clearProjects, createProject, loadProject, loadProjects, selectProject,
    loadUploadToken, regenerateUploadToken} from './actions';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {createSelector} from 'reselect';
import {compose} from 'ramda';

export interface ProjectState
{
    projects: Project[];
    selectedProject: string | null;
    uploadToken: string | null;

    loadProjectsRequest: Request;
    loadProjectRequest: Request;
    createProjectRequest: Request;
    uploadTokenRequest: Request;
}

let reducer = reducerWithInitialState<ProjectState>({
    projects: [],
    selectedProject: null,
    uploadToken: null,
    loadProjectsRequest: createRequest(),
    loadProjectRequest: createRequest(),
    createProjectRequest: createRequest(),
    uploadTokenRequest: createRequest()
})
.case(clearProjects, state => ({
    ...state,
    loadProjectRequest: createRequest(),
    loadProjectsRequest: createRequest(),
    createProjectRequest: createRequest(),
    uploadTokenRequest: createRequest(),
    projects: [],
    selectedProject: null,
    uploadToken: null
}))
.case(selectProject, (state, selectedProject) => ({
    ...state,
    selectedProject,
    uploadToken: null
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r,
        loadProject,
        state => state.loadProjectRequest,
        (state: ProjectState, action) => ({
            projects: [...state.projects.filter(p => p.id !== action.payload.result.id), action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        loadProjects,
        (state: ProjectState) => state.loadProjectsRequest,
        (state: ProjectState, action) => ({
            projects: action.payload.result
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        createProject,
        (state: ProjectState) => state.createProjectRequest),
    (r: typeof reducer) => hookRequestActions(r,
        loadUploadToken,
        state => state.uploadTokenRequest,
        (state: ProjectState, action) => ({
            uploadToken: action.payload.result
        })),
    (r: typeof reducer) => hookRequestActions(r,
        regenerateUploadToken,
        state => state.uploadTokenRequest,
        (state: ProjectState, action) => ({
            uploadToken: action.payload.result
        })
))(reducer);

export const getProjects = (state: AppState) => state.project.projects;
export const getSelectedProjectName = (state: AppState) => state.project.selectedProject;
export const getProjectByName = (projects: Project[], name: string) => projects.find(p => p.name === name) || null;
export const getSelectedProject = createSelector(getProjects, getSelectedProjectName,
    (projects: Project[], name: string) => name === null ? null : getProjectByName(projects, name)
);
export const getUploadToken = (state: AppState) => state.project.uploadToken;

export const projectReducer = reducer;
