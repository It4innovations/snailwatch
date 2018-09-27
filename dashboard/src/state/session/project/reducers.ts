import {compose} from 'ramda';
import {createSelector} from 'reselect';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Project} from '../../../lib/project/project';
import {createCrudReducer} from '../../../util/crud';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {clearSession, initProjectSession} from '../actions';
import {deselectProject, ProjectActions, regenerateUploadToken, selectProject} from './actions';

export interface ProjectState
{
    projects: Project[];
    selectedProject: string | null;
    projectInitialized: boolean;
    projectRequest: Request;
}

export const initialState: ProjectState = {
    projects: [],
    selectedProject: null,
    projectInitialized: false,
    projectRequest: createRequest()
};

let reducers = reducerWithInitialState<ProjectState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(deselectProject, (state) => ({
    ...state,
    selectedProject: null,
    projectInitialized: false,
    uploadToken: null
}))
.case(initProjectSession.done, (state) => ({
    ...state,
    projectInitialized: true
}));

reducers = compose(
    (r: typeof reducers) => hookRequestActions(r,
        selectProject,
        state => state.projectRequest,
        (state, action) => ({
            ...state,
            selectedProject: action.payload.params,
            projectInitialized: false
        })
    ),
    (r: typeof reducers) => hookRequestActions(r,
        regenerateUploadToken,
        state => state.projectRequest,
        (state, action) => ({
            projects: state.projects.map(p =>
                p.id === action.payload.params.project ? {
                    ...p,
                    uploadToken: action.payload.result
                } : p
            )
        })
    )
)(reducers);

reducers = createCrudReducer<ProjectState, Project>(
    reducers,
    ProjectActions,
    'projects',
    state => state.projectRequest,
);

export const getProjects = (state: AppState) => state.session.project.projects;
export const getSelectedProjectName = (state: AppState) => state.session.project.selectedProject;
export const getProjectById = (projects: Project[], id: string) => projects.find(p => p.id === id) || null;
export const getProjectByName = (projects: Project[], name: string) => projects.find(p => p.name === name) || null;
export const isProjectInitialized = (state: AppState) => state.session.project.projectInitialized;
export const getSelectedProject = createSelector(getProjects, getSelectedProjectName,
    (projects: Project[], name: string) => name === null ? null : getProjectByName(projects, name)
);

export const projectReducer = reducers;
