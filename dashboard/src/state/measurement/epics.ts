import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {Action} from 'typescript-fsa';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/if';
import {LoadMeasurementParams, loadMeasurements} from './actions';
import {getMeasurements} from './reducer';
import {getPage} from '../../lib/api/pagination';
import {mapRequestToActions} from '../../util/request';

const loadMeasurementsForProject = (action$: ActionsObservable<ReduxAction>,
                                    store: Store<AppState>,
                                    deps: ServiceContainer) =>
    action$
        .ofAction(loadMeasurements.started)
        .switchMap((action: Action<LoadMeasurementParams>) =>
            {
                const {user, project, filters, reload} = action.payload;
                const requestCount = 50;
                const page = reload ? 1 : getPage(getMeasurements(store.getState()).length, requestCount);

                return mapRequestToActions(loadMeasurements, action,
                    deps.client.loadMeasurements(user, project, filters, '-timestamp', page, requestCount));
            }
        );

export const measurementEpics = combineEpics(
    loadMeasurementsForProject
);
