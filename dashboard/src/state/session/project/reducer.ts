import {compose} from 'ramda';
import {createSelector} from 'reselect';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Project} from '../../../lib/project/project';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {clearSession} from '../actions';
import {
    createProject,
    deselectProject,
    loadProject,
    loadProjects,
    loadUploadToken,
    regenerateUploadToken,
    selectProject
} from './actions';

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

const initialState: ProjectState = {
    projects: [],
    selectedProject: null,
    uploadToken: null,
    loadProjectsRequest: createRequest(),
    loadProjectRequest: createRequest(),
    createProjectRequest: createRequest(),
    uploadTokenRequest: createRequest()
};

let reducer = reducerWithInitialState<ProjectState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(deselectProject, (state) => ({
    ...state,
    selectedProject: null,
    uploadToken: null
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r,
        loadProject,
        state => state.loadProjectRequest,
        (state, action) => ({
            projects: [...state.projects.filter(p => p.id !== action.payload.result.id), action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        loadProjects,
        state => state.loadProjectsRequest,
        (state, action) => ({
            projects: action.payload.result
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        createProject,
        state => state.createProjectRequest
    ),
    (r: typeof reducer) => hookRequestActions(r,
        selectProject,
        state => state.loadProjectRequest,
        (state, action) => ({
            ...state,
            selectedProject: action.payload.params
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        [loadUploadToken, regenerateUploadToken],
        state => state.uploadTokenRequest,
        (state, action) => ({
            uploadToken: action.payload.result
        })
    )
)(reducer);

export const getProjects = (state: AppState) => state.session.project.projects;
export const getSelectedProjectName = (state: AppState) => state.session.project.selectedProject;
export const getProjectByName = (projects: Project[], name: string) => projects.find(p => p.name === name) || null;
export const getSelectedProject = createSelector(getProjects, getSelectedProjectName,
    (projects: Project[], name: string) => name === null ? null : getProjectByName(projects, name)
);
export const getUploadToken = (state: AppState) => state.session.project.uploadToken;

export const projectReducer = reducer;
