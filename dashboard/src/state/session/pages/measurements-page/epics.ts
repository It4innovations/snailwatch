import {ActionsObservable, combineEpics} from 'redux-observable';
import '../../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import {createRequestEpic, mapRequestToActions} from '../../../../util/request';
import {deleteAllMeasurementsAction, deleteMeasurementAction, loadMeasurementsAction} from './actions';
import {getUser} from '../../user/reducer';
import {getSelectedProject} from '../../project/reducer';
import {getRangeFilter} from '../reducers';
import {getMeasurementsPageSelection} from './reducer';
import {AppState} from '../../../app/reducers';
import {ServiceContainer} from '../../../app/di';
import {Action} from 'typescript-fsa';
import {Action as ReduxAction, Store} from 'redux';
import {Observable} from 'rxjs/Observable';

const loadMeasurements = createRequestEpic(loadMeasurementsAction, (action, state, deps) => {
    const user = getUser(state);
    const project = getSelectedProject(state);
    const rangeFilter = getRangeFilter(state);

    return deps.client.loadMeasurements(user, project, getMeasurementsPageSelection(state), rangeFilter);
});

const deleteMeasurement = createRequestEpic(deleteMeasurementAction, (action, state, deps) => {
    const user = getUser(state);
    return deps.client.deleteMeasurement(user, action.payload);
});

const deleteAllMeasurements = (action$: ActionsObservable<ReduxAction>,
                               store: Store<AppState>,
                               deps: ServiceContainer) =>
    action$
        .ofAction(deleteAllMeasurementsAction.started)
        .switchMap((action: Action<{}>) =>
            mapRequestToActions(deleteAllMeasurementsAction, action,
                deps.client.deleteAllMeasurements(getUser(store.getState())))
                .flatMap(result => Observable.from([
                    result,
                    loadMeasurementsAction.started({})
                ]))
        );

export const measurementsEpics = combineEpics(
    loadMeasurements,
    deleteMeasurement,
    deleteAllMeasurements
);
