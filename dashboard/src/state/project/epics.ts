import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {
    createProject, CreateProjectParams, LoadProjectsParams, loadProjects, loadProject,
    LoadProjectParams, selectProject
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
                    return deps.client.loadProjects(user)
                        .map(projects =>
                            loadProjects.done({
                                params: action.payload,
                                result: projects
                            })
                        ).catch(error =>
                            Observable.of(loadProjects.failed({
                                params: action.payload,
                                error
                            }))
                        );
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
                    return deps.client.loadProject(user, name)
                        .map(project =>
                            loadProject.done({
                                params: action.payload,
                                result: project
                            })
                        ).catch(error =>
                            Observable.of(loadProject.failed({
                                params: action.payload,
                                error
                            }))
                        );
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
            deps.client.createProject(action.payload.user, action.payload.name)
                        .flatMap(result =>
                            Observable.from([
                                createProject.done({
                                    params: action.payload,
                                    result
                                }),
                                loadProjects.started({
                                    user: action.payload.user,
                                    force: true
                                })
                            ])
                        ).catch(error =>
                            Observable.of(createProject.failed({
                                params: action.payload,
                                error
                            }))
                        )
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

export const projectEpics = combineEpics(
    loadProjectsEpic,
    loadProjectEpic,
    createProjectEpic,
    loadProjectAfterSelectEpic
);
