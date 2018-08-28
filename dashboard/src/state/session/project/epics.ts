import {push} from 'react-router-redux';
import {combineEpics} from 'redux-observable';
import {from, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ofAction} from '../../../util/redux-observable';
import {createRequestEpic} from '../../../util/request';
import {AppEpic} from '../../app/app-epic';
import {Navigation} from '../../nav/routes';
import {initSession} from '../actions';
import {getUser} from '../user/reducer';
import {
    deselectProject,
    loadProject,
    loadUploadToken,
    ProjectActions,
    regenerateUploadToken,
    selectProject
} from './actions';
import {getSelectedProject} from './reducer';

const loadProjectsEpic = createRequestEpic(ProjectActions.load, (action, state, deps) =>
    deps.client.loadProjects(getUser(state))
);

const loadProjectEpic = createRequestEpic(loadProject, (action, state, deps) =>
    deps.client.loadProject(getUser(state), action.payload)
);

const createProjectEpic = createRequestEpic(ProjectActions.create, (action, state, deps) =>
    deps.client.createProject(getUser(state), action.payload)
);

const updateProjectEpic = createRequestEpic(ProjectActions.update, (action, state, deps) =>
    deps.client.updateProject(getUser(state), action.payload)
);

const loadProjectAfterSelectEpic: AppEpic = action$ =>
    action$.pipe(
        ofAction(selectProject.started),
        switchMap(action =>
            from([
                selectProject.done({
                    params: action.payload,
                    result: action.payload
                }),
                initSession,
                push(Navigation.Overview)
            ])
        )
    );

const loadUploadTokenEpic = createRequestEpic(loadUploadToken, (action, state, deps) =>
    deps.client.loadUploadToken(getUser(state), getSelectedProject(state))
);
const regenerateUploadTokenEpic = createRequestEpic(regenerateUploadToken, (action, state, deps) =>
    deps.client.regenerateUploadToken(getUser(state), getSelectedProject(state))
);

const goToProjectSelectionAfterUnselecting: AppEpic = (action$) =>
    action$.pipe(
        ofAction(deselectProject),
        switchMap(() => observableOf(push(Navigation.Projects)))
    );

export const projectEpics = combineEpics(
    loadProjectsEpic,
    loadProjectEpic,
    createProjectEpic,
    updateProjectEpic,
    loadProjectAfterSelectEpic,
    loadUploadTokenEpic,
    regenerateUploadTokenEpic,
    goToProjectSelectionAfterUnselecting
);
