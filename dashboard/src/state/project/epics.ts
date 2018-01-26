import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {Action} from 'typescript-fsa';
import {createProject, CreateProjectParams, LoadProjectParams, loadProjects} from './actions';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/if';
import 'rxjs/add/observable/from';

const loadProjectsEpic = (action$: ActionsObservable<ReduxAction>,
                          store: Store<AppState>,
                          deps: ServiceContainer) =>
    action$
        .ofAction(loadProjects.started)
        .switchMap((action: Action<LoadProjectParams>) =>
            {
                const storedProjects = store.getState().project.projects;
                if (action.payload.force || storedProjects === null)
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
    createProjectEpic
);
