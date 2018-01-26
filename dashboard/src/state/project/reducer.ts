import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AppState} from '../app/reducers';
import {Project} from '../../lib/project/project';
import {loadProjects} from './actions';
import {RequestContext, requestDone, requestErrored, requestStarted} from '../../util/request';

export interface ProjectState
{
    projects: Project[];
    projectRequest: RequestContext;
}

const reducer = reducerWithInitialState<ProjectState>({
    projects: null,
    projectRequest: requestDone()
})
.case(loadProjects.started, state => ({
    ...state,
    projectRequest: requestStarted()
}))
.case(loadProjects.failed, (state, response) => ({
    ...state,
    projectRequest: requestErrored(response.error)
}))
.case(loadProjects.done, (state, response) => ({
    ...state,
    projectRequest: requestDone(),
    projects: response.result
}));

export const getProjects = (state: AppState) => state.project.projects || [];

export const projectReducer = reducer;
