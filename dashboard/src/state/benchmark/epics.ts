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
import {loadBenchmarks} from './actions';
import {Project} from '../../lib/project/project';
import {getBenchmarks} from './reducer';

const loadBenchmarksForProject = (action$: ActionsObservable<ReduxAction>,
                                  store: Store<AppState>,
                                  deps: ServiceContainer) =>
    action$
        .ofAction(loadBenchmarks.started)
        .switchMap((action: Action<{
            user: User,
            project: Project
            }>) =>
            {
                const storedBenchmarks = store.getState().benchmark.benchmarks;
                if (!storedBenchmarks.hasOwnProperty(action.payload.project.id))
                {
                    return deps.client.loadBenchmarks(action.payload.user, action.payload.project)
                        .map(benchmarks =>
                            loadBenchmarks.done({
                                params: action.payload,
                                result: benchmarks
                            })
                        ).catch(error =>
                            Observable.of(loadBenchmarks.failed({
                                params: action.payload,
                                error
                            }))
                        );
                }
                else return Observable.of(loadBenchmarks.done({
                    params: action.payload,
                    result: getBenchmarks(store.getState(), action.payload.project)
                }));
            }
        );

export const benchmarkEpics = combineEpics(
    loadBenchmarksForProject
);
