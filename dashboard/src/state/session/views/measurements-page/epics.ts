import {combineEpics} from 'redux-observable';
import '../../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import {createRequestEpic} from '../../../../util/request';
import {deleteMeasurementAction, loadMeasurementsAction} from './actions';
import {getUser} from '../../user/reducer';
import {getSelectedProject} from '../../project/reducer';
import {getRangeFilter} from '../reducers';
import {getMeasurementsPageSelection} from './reducer';

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

export const measurementsEpics = combineEpics(
    loadMeasurements,
    deleteMeasurement
);
