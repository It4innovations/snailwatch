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
import {loadMeasurements} from './actions';
import {Project} from '../../lib/project/project';
import {getMeasurements} from './reducer';

const loadMeasurementsForProject = (action$: ActionsObservable<ReduxAction>,
                                    store: Store<AppState>,
                                    deps: ServiceContainer) =>
    action$
        .ofAction(loadMeasurements.started)
        .switchMap((action: Action<{
            user: User,
            project: Project
            }>) =>
            {
                const storedMeasurements = store.getState().measurement.measurements;
                if (!storedMeasurements.hasOwnProperty(action.payload.project.id))
                {
                    return deps.client.loadMeasurements(action.payload.user, action.payload.project)
                        .map(measurements =>
                            loadMeasurements.done({
                                params: action.payload,
                                result: measurements
                            })
                        ).catch(error =>
                            Observable.of(loadMeasurements.failed({
                                params: action.payload,
                                error
                            }))
                        );
                }
                else return Observable.of(loadMeasurements.done({
                    params: action.payload,
                    result: getMeasurements(store.getState(), action.payload.project)
                }));
            }
        );

export const measurementEpics = combineEpics(
    loadMeasurementsForProject
);
