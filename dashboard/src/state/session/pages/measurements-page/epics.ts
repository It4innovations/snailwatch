import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../../util/request';
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

const deleteAllMeasurements = createRequestEpic(deleteAllMeasurementsAction, (action, store, deps) => {
    return deps.client.deleteProjectMeasurements(getToken(store.value), getSelectedProject(store.value));
});

export const measurementsEpics = combineEpics(
    loadMeasurements,
    deleteMeasurement,
    deleteAllMeasurements
);
