import {compose} from 'ramda';
import {createSelector} from 'reselect';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Project} from '../../../lib/project/project';
import {createCrudReducer} from '../../../util/crud';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {clearSession} from '../actions';
import {deselectProject, loadUploadToken, ProjectActions, regenerateUploadToken, selectProject} from './actions';

export interface ProjectState
{
    projects: Project[];
    selectedProject: string | null;
    uploadToken: string | null;
    projectRequest: Request;
    uploadTokenRequest: Request;
}

const initialState: ProjectState = {
    projects: [],
    selectedProject: null,
    uploadToken: null,
    projectRequest: createRequest(),
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
        selectProject,
        state => state.projectRequest,
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

reducer = createCrudReducer<ProjectState, Project>(
    reducer,
    ProjectActions,
    'projects',
    state => state.projectRequest,
);

export const getProjects = (state: AppState) => state.session.project.projects;
export const getSelectedProjectName = (state: AppState) => state.session.project.selectedProject;
export const getProjectByName = (projects: Project[], name: string) => projects.find(p => p.name === name) || null;
export const getSelectedProject = createSelector(getProjects, getSelectedProjectName,
    (projects: Project[], name: string) => name === null ? null : getProjectByName(projects, name)
);
export const getUploadToken = (state: AppState) => state.session.project.uploadToken;

export const projectReducer = reducer;
