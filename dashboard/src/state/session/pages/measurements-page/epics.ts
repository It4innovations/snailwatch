import {combineEpics} from 'redux-observable';
import {from as observableFrom} from 'rxjs';
import {mergeMap, switchMap} from 'rxjs/operators';
import {Action} from 'typescript-fsa';
import {ofAction} from '../../../../util/redux-observable';
import {createRequestEpic, mapRequestToActions} from '../../../../util/request';
import {AppEpic} from '../../../app/app-epic';
import {getSelectedProject} from '../../project/reducer';
import {getUser} from '../../user/reducer';
import {getRangeFilter} from '../reducers';
import {deleteAllMeasurementsAction, deleteMeasurementAction, loadMeasurementsAction} from './actions';
import {getMeasurementsPageView} from './reducer';

const loadMeasurements = createRequestEpic(loadMeasurementsAction, (action, state, deps) => {
    const user = getUser(state);
    const project = getSelectedProject(state);
    const rangeFilter = getRangeFilter(state);

    return deps.client.loadMeasurements(user, project, getMeasurementsPageView(state), rangeFilter);
});

const deleteMeasurement = createRequestEpic(deleteMeasurementAction, (action, state, deps) => {
    const user = getUser(state);
    return deps.client.deleteMeasurement(user, action.payload);
});

const deleteAllMeasurements: AppEpic = (action$, store, deps) =>
    action$.pipe(
        ofAction(deleteAllMeasurementsAction.started),
        switchMap((action: Action<{}>) =>
            mapRequestToActions(deleteAllMeasurementsAction, action,
                deps.client.deleteProjectMeasurements(getUser(store.value), getSelectedProject(store.value))).pipe(
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
