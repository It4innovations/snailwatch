import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AppState} from '../app/reducers';
import {Project} from '../../lib/project/project';
import {loadProjects} from './actions';

export interface ProjectState
{
    projects: Project[];
    projectsLoading: boolean;
    projectsLoadError: string;
}

const reducer = reducerWithInitialState<ProjectState>({
    projects: null,
    projectsLoading: false,
    projectsLoadError: null
})
.case(loadProjects.started, state => ({
    ...state,
    projectsLoading: true,
    projectsLoadError: null
}))
.case(loadProjects.failed, (state, error) => ({
    ...state,
    projectsLoading: false,
    projectsLoadError: error.error
}))
.case(loadProjects.done, (state, projects) => ({
    ...state,
    projectsLoading: false,
    projectsLoadError: null,
    projects: projects.result
}));

export const getProjects = (state: AppState) => state.project.projects;

export const projectReducer = reducer;
