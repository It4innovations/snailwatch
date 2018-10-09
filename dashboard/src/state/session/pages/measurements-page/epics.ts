import {combineEpics} from 'redux-observable';
import {from as observableFrom} from 'rxjs';
import {mergeMap, switchMap} from 'rxjs/operators';
import {Action} from 'typescript-fsa';
import {ofAction} from '../../../../util/redux-observable';
import {createRequestEpic, mapRequestToActions} from '../../../../util/request';
import {AppEpic} from '../../../app/app-epic';
import {getSelectedProject} from '../../project/reducers';
import {getToken} from '../../user/reducers';
import {getRangeFilter} from '../reducers';
import {deleteAllMeasurementsAction, deleteMeasurementAction, loadMeasurementsAction} from './actions';
import {getMeasurementsPageView} from './reducer';

const loadMeasurements = createRequestEpic(loadMeasurementsAction, (action, store, deps) => {
    const state = store.value;
    const project = getSelectedProject(state);
    const rangeFilter = getRangeFilter(state);

    return deps.client.loadMeasurements(getToken(state), project, getMeasurementsPageView(state), rangeFilter);
});

const deleteMeasurement = createRequestEpic(deleteMeasurementAction, (action, store, deps) => {
    return deps.client.deleteMeasurement(getToken(store.value), action.payload);
});

const deleteAllMeasurements: AppEpic = (action$, store, deps) =>
    action$.pipe(
        ofAction(deleteAllMeasurementsAction.started),
        switchMap((action: Action<{}>) =>
            mapRequestToActions(deleteAllMeasurementsAction, action,
                deps.client.deleteProjectMeasurements(getToken(store.value), getSelectedProject(store.value))).pipe(
                mergeMap(result => observableFrom([
                    result,
                    loadMeasurementsAction.started({})
                ])))
        ));

export const measurementsEpics = combineEpics(
    loadMeasurements,
    deleteMeasurement,
    deleteAllMeasurements
);
