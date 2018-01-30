import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {Action} from 'typescript-fsa';
import {
    createProject, CreateProjectParams, LoadProjectsParams, loadProjects, loadProject,
    LoadProjectParams
} from './actions';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/if';
import 'rxjs/add/observable/from';
import {isEmpty} from 'ramda';
import {getProjectByName, getProjects} from './reducer';

const loadProjectsEpic = (action$: ActionsObservable<ReduxAction>,
                          store: Store<AppState>,
                          deps: ServiceContainer) =>
    action$
        .ofAction(loadProjects.started)
        .switchMap((action: Action<LoadProjectsParams>) =>
            {
                const storedProjects = getProjects(store.getState());
                if (action.payload.force || isEmpty(storedProjects))
                {
                    return deps.client.loadProjects(action.payload.user)
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
                let storedProject = getProjectByName(getProjects(store.getState()), action.payload.name);
                if (storedProject === null)
                {
                    return deps.client.loadProject(action.payload.user, action.payload.name)
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

export const projectEpics = combineEpics(
    loadProjectsEpic,
    loadProjectEpic,
    createProjectEpic
);
