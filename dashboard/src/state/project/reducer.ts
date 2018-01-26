import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AppState} from '../app/reducers';
import {Project} from '../../lib/project/project';
import {loadProjects} from './actions';
import {RequestContext, requestDone, requestErrored, requestStarted} from '../../util/request';

export interface ProjectState
{
    projects: Project[];
    projectsLoadRequest: RequestContext;
}

const reducer = reducerWithInitialState<ProjectState>({
    projects: null,
    projectsLoadRequest: requestDone()
})
.case(loadProjects.started, state => ({
    ...state,
    projectsLoadRequest: requestStarted()
}))
.case(loadProjects.failed, (state, response) => ({
    ...state,
    projectsLoadRequest: requestErrored(response.error)
}))
.case(loadProjects.done, (state, response) => ({
    ...state,
    projectsLoadRequest: requestDone(),
    projects: response.result
}));

export const getProjects = (state: AppState) => state.project.projects;

export const projectReducer = reducer;
