import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../../app/di';
import {AppState} from '../../app/reducers';
import {
    createProject,
    CreateProjectParams,
    loadProjects,
    loadProject,
    selectProject,
    loadUploadToken,
    regenerateUploadToken,
    deselectProject
} from './actions';
import {Observable} from 'rxjs/Observable';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/if';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import {getUser} from '../user/reducer';
import {Action} from 'typescript-fsa';
import {AppEpic} from '../../app/app-epic';
import {createRequestEpic, mapRequestToActions} from '../../../util/request';
import {loadSelectionsAction} from '../selection/actions';
import {push} from 'react-router-redux';
import {Navigation} from '../../nav/routes';

const loadProjectsEpic = createRequestEpic(loadProjects, (action, state, deps) =>
    deps.client.loadProjects(action.payload.user)
);

const loadProjectEpic = createRequestEpic(loadProject, (action, state, deps) =>
    deps.client.loadProject(action.payload.user, action.payload.name)
);

const createProjectEpic = (action$: ActionsObservable<ReduxAction>,
                           store: Store<AppState>,
                           deps: ServiceContainer) =>
    action$
        .ofAction(createProject.started)
        .switchMap((action: Action<CreateProjectParams>) =>
            mapRequestToActions(createProject, action,
                deps.client.createProject(action.payload.user, action.payload.name))
                .flatMap(result => Observable.from([
                    result,
                    loadProjects.started({
                        user: action.payload.user,
                        force: true
                    })
                ]))
        );

const loadProjectAfterSelectEpic: AppEpic = (action$: ActionsObservable<ReduxAction>,
                                             store: Store<AppState>,
                                             deps) =>
    action$
        .ofAction(selectProject.started)
        .switchMap((action: Action<string>) => {
            async function load(): Promise<ReduxAction[]>
            {
                const user = getUser(store.getState());
                const project = await deps.client.loadProject(user, action.payload).toPromise();
                const selections = await deps.client.loadSelections(user, project).toPromise();

                return [
                    loadSelectionsAction.done({
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

            return Observable.fromPromise(load()).switchMap(actions => Observable.from(actions));
        });

const loadUploadTokenEpic = createRequestEpic(loadUploadToken, (action, state, deps) =>
    deps.client.loadUploadToken(action.payload.user, action.payload.project)
);
const regenerateUploadTokenEpic = createRequestEpic(regenerateUploadToken, (action, state, deps) =>
    deps.client.regenerateUploadToken(action.payload.user, action.payload.project)
);

const goToProjectSelectionAfterUnselecting = (action$: ActionsObservable<ReduxAction>) =>
    action$
    .ofAction(deselectProject)
    .switchMap(() => Observable.of(push(Navigation.Projects)));

export const projectEpics = combineEpics(
    loadProjectsEpic,
    loadProjectEpic,
    createProjectEpic,
    loadProjectAfterSelectEpic,
    loadUploadTokenEpic,
    regenerateUploadTokenEpic,
    goToProjectSelectionAfterUnselecting
);
