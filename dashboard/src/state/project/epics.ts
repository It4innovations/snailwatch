import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {
    createProject, CreateProjectParams, LoadProjectsParams, loadProjects, loadProject,
    LoadProjectParams, selectProject, loadUploadToken, regenerateUploadToken
} from './actions';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/if';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/empty';
import {isEmpty} from 'ramda';
import {getProjectByName, getProjects} from './reducer';
import {getUser} from '../user/reducer';
import {Action} from 'typescript-fsa';
import {AppEpic} from '../app/app-epic';
import {createRequestEpic, mapRequestToActions} from '../../util/request';
import {clearMeasurements} from '../measurement/actions';
import {clearViews} from '../view/actions';

const loadProjectsEpic = (action$: ActionsObservable<ReduxAction>,
                          store: Store<AppState>,
                          deps: ServiceContainer) =>
    action$
        .ofAction(loadProjects.started)
        .switchMap((action: Action<LoadProjectsParams>) =>
            {
                const {user, force} = action.payload;
                const storedProjects = getProjects(store.getState());
                if (force || isEmpty(storedProjects))
                {
                    return mapRequestToActions(loadProjects, action, deps.client.loadProjects(user));
                }
                else return Observable.of(loadProjects.done({
                    params: action.payload,
                    result: storedProjects
                }));
            }
        );

const loadProjectEpic = (action$: ActionsObservable<ReduxAction>,
                         store: Store<AppState>,
                         deps: ServiceContainer) =>
    action$
        .ofAction(loadProject.started)
        .switchMap((action: Action<LoadProjectParams>) =>
            {
                const {user, name} = action.payload;
                let storedProject = getProjectByName(getProjects(store.getState()), name);
                if (storedProject === null)
                {
                    return mapRequestToActions(loadProject, action, deps.client.loadProject(user, name));
                }
                else return Observable.of(loadProject.done({
                    params: action.payload,
                    result: storedProject
                }));
            }
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
                                             store: Store<AppState>) =>
    action$
        .ofAction(selectProject)
        .switchMap((action: Action<string>): Observable<ReduxAction> => {
            const user = getUser(store.getState());
            const params = {
                user: user,
                name: action.payload
            };
            const project = getProjectByName(getProjects(store.getState()), action.payload);

            if (project === null)
            {
                return Observable.of(loadProject.started(params));
            }

            return Observable.of(loadProject.done({
                params: params,
                result: project
            }));
        });

const clearDataAfterProjectSelect: AppEpic = (action$: ActionsObservable<ReduxAction>) =>
    action$
        .ofAction(selectProject)
        .switchMap(() => Observable.from([
            clearMeasurements(),
            clearViews()
        ]));

const loadUploadTokenEpic = createRequestEpic(loadUploadToken, (action, state, deps) =>
    deps.client.loadUploadToken(action.payload.user, action.payload.project)
);
const regenerateUploadTokenEpic = createRequestEpic(regenerateUploadToken, (action, state, deps) =>
    deps.client.regenerateUploadToken(action.payload.user, action.payload.project)
);

export const projectEpics = combineEpics(
    loadProjectsEpic,
    loadProjectEpic,
    createProjectEpic,
    loadProjectAfterSelectEpic,
    clearDataAfterProjectSelect,
    loadUploadTokenEpic,
    regenerateUploadTokenEpic
);
