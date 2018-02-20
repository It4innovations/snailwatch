import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {Action} from 'typescript-fsa';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/if';
import {deleteMeasurement, LoadMeasurementParams, loadMeasurements} from './actions';
import {getMeasurements, MEASUREMENT_PAGE_SIZE} from './reducer';
import {getPage} from '../../lib/api/pagination';
import {createRequestEpic, mapRequestToActions} from '../../util/request';

const loadMeasurementsForProject = (action$: ActionsObservable<ReduxAction>,
                                    store: Store<AppState>,
                                    deps: ServiceContainer) =>
    action$
        .ofAction(loadMeasurements.started)
        .switchMap((action: Action<LoadMeasurementParams>) =>
            {
                const {user, project, filters, sort, reload, page} = action.payload;
                const requestCount = MEASUREMENT_PAGE_SIZE;
                const calculatePage = () => {
                    if (page !== null) return page + 1;
                    if (reload) return 1;
                    return getPage(getMeasurements(store.getState()).length, requestCount);
                };

                return mapRequestToActions(loadMeasurements, action,
                    deps.client.loadMeasurements(user, project, filters, sort, calculatePage(), requestCount));
            }
        );

const deleteMeasurementEpic = createRequestEpic(deleteMeasurement, (action, state, deps) =>
     deps.client.deleteMeasurement(action.payload.user, action.payload.measurement)
);

export const measurementEpics = combineEpics(
    loadMeasurementsForProject,
    deleteMeasurementEpic
);
