import {push} from 'react-router-redux';
import {Action as ReduxAction} from 'redux';
import {combineEpics} from 'redux-observable';
import {from as observableFrom, of as observableOf} from 'rxjs';
import {mergeMap, switchMap} from 'rxjs/operators';
import {Action} from 'typescript-fsa';
import {ofAction} from '../../../util/redux-observable';
import {createRequestEpic, mapRequestToActions} from '../../../util/request';
import {AppEpic} from '../../app/app-epic';
import {Navigation} from '../../nav/routes';
import {SelectionActions} from '../selection/actions';
import {getUser} from '../user/reducer';
import {
    createProject,
    deselectProject,
    loadProject,
    loadProjects,
    loadUploadToken,
    regenerateUploadToken,
    selectProject
} from './actions';
import {getSelectedProject} from './reducer';

const loadProjectsEpic = createRequestEpic(loadProjects, (action, state, deps) =>
    deps.client.loadProjects(getUser(state))
);

const loadProjectEpic = createRequestEpic(loadProject, (action, state, deps) =>
    deps.client.loadProject(getUser(state), action.payload)
);

const createProjectEpic: AppEpic = (action$, store, deps) =>
    action$.pipe(
        ofAction(createProject.started),
        switchMap((action: Action<string>) =>
            mapRequestToActions(createProject, action,
                deps.client.createProject(getUser(store.value), action.payload)).pipe(
                mergeMap(result => observableFrom([
                    result,
                    loadProjects.started({
                        force: true
                    })
                ])))
        ));

const loadProjectAfterSelectEpic: AppEpic = (action$, store, deps) =>
    action$.pipe(
        ofAction(selectProject.started),
        switchMap((action: Action<string>) => {
            async function load(): Promise<ReduxAction[]>
            {
                const user = getUser(store.value);
                const project = await deps.client.loadProject(user, action.payload).toPromise();
                const selections = await deps.client.loadSelections(user, project).toPromise();

                return [
                    SelectionActions.load.done({
                        params: {
                            user,
                            project
                        },
                        result: selections
                    }),
                    selectProject.done({
                        params: action.payload,
                        result: project
                    }),
                    push(Navigation.Overview)
                ];
            }

            return observableFrom(load()).pipe(switchMap(actions => observableFrom(actions)));
        }));

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
    loadProjectAfterSelectEpic,
    loadUploadTokenEpic,
    regenerateUploadTokenEpic,
    goToProjectSelectionAfterUnselecting
);
