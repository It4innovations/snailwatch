import {push} from 'react-router-redux';
import {combineEpics} from 'redux-observable';
import {from, of as observableOf} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ofAction} from '../../../util/redux-observable';
import {createRequestEpic} from '../../../util/request';
import {AppEpic} from '../../app/app-epic';
import {Navigation} from '../../nav/routes';
import {initProjectSession} from '../actions';
import {getToken} from '../user/reducers';
import {deselectProject, ProjectActions, regenerateUploadToken, selectProject} from './actions';
import {getProjectById, getProjects} from './reducers';

const loadProjectsEpic = createRequestEpic(ProjectActions.load, (action, store, deps) =>
    deps.client.loadProjects(getToken(store.value))
);

const createProjectEpic = createRequestEpic(ProjectActions.create, (action, store, deps) =>
    deps.client.createProject(getToken(store.value), action.payload)
);

const updateProjectEpic = createRequestEpic(ProjectActions.update, (action, store, deps) =>
    deps.client.updateProject(getToken(store.value), action.payload)
);

const initSessionAfterProjectSelect: AppEpic = action$ =>
    action$.pipe(
        ofAction(selectProject.started),
        switchMap(action =>
            from([
                selectProject.done({
                    params: action.payload,
                    result: action.payload
                }),
                initProjectSession.started({}),
                push(Navigation.Dashboard)
            ])
        )
    );

const regenerateUploadTokenEpic = createRequestEpic(regenerateUploadToken, (action, store, deps) =>
    deps.client.regenerateUploadToken(getToken(store.value), getProjectById(getProjects(store.value),
        action.payload.project))
);

const goToProjectSelectionAfterUnselecting: AppEpic = (action$) =>
    action$.pipe(
        ofAction(deselectProject),
        switchMap(() => observableOf(push(Navigation.Projects)))
    );

export const projectEpics = combineEpics(
    loadProjectsEpic,
    createProjectEpic,
    updateProjectEpic,
    initSessionAfterProjectSelect,
    regenerateUploadTokenEpic,
    goToProjectSelectionAfterUnselecting
);
