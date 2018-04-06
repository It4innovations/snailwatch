import {combineEpics} from 'redux-observable';
import '../../util/redux-observable';
import {deleteMeasurement} from './actions';
import {createRequestEpic} from '../../util/request';

const deleteMeasurementEpic = createRequestEpic(deleteMeasurement, (action, state, deps) =>
     deps.client.deleteMeasurement(action.payload.user, action.payload.measurement)
);

export const measurementEpics = combineEpics(
    deleteMeasurementEpic
);
