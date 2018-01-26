import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {Action} from 'typescript-fsa';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/if';
import {User} from '../../lib/user/user';
import {loadProjects} from './actions';
import {getProjects} from './reducer';

const loadProjectsEpic = (action$: ActionsObservable<ReduxAction>,
                          store: Store<AppState>,
                          deps: ServiceContainer) =>
    action$
        .ofAction(loadProjects.started)
        .switchMap((action: Action<User>) =>
            {
                const storedProjects = getProjects(store.getState());
                if (storedProjects === null)
                {
                    return deps.client.loadProjects(action.payload)
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

export const projectEpics = combineEpics(
    loadProjectsEpic
);
