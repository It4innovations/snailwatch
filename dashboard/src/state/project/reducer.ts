import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AppState} from '../app/reducers';
import {Project} from '../../lib/project/project';
import {createProject, loadProjects} from './actions';
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
.cases([loadProjects.started, createProject.started], state => ({
    ...state,
    projectRequest: requestStarted()
}))
.cases([loadProjects.failed, createProject.failed], (state, response) => ({
    ...state,
    projectRequest: requestErrored(response.error)
}))
.case(loadProjects.done, (state, response) => ({
    ...state,
    projectRequest: requestDone(),
    projects: response.result
}))
.case(createProject.done, (state) => ({
    ...state,
    projectRequest: requestDone()
}));

export const getProjects = (state: AppState) => state.project.projects || [];

export const projectReducer = reducer;
