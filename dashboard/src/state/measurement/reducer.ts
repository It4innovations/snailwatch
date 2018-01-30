import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {
    createRequest, hookRequestActions, Request
} from '../../util/request';
import {AppState} from '../app/reducers';
import {Measurement} from '../../lib/measurement/measurement';
import {clearMeasurements, loadMeasurements} from './actions';
import {createDatabase, Database, getDatabaseItems} from '../../util/database';

export interface MeasurementState
{
    measurements: Database<Measurement>;
    loadMeasurementsRequest: Request;
}

let reducer = reducerWithInitialState<MeasurementState>({
    measurements: createDatabase(),
    loadMeasurementsRequest: createRequest()
})
.case(clearMeasurements, (state) => ({
    ...state,
    measurements: createDatabase()
}));

reducer = hookRequestActions(reducer, loadMeasurements,
    (state: MeasurementState) => state.loadMeasurementsRequest,
    (state: MeasurementState, response) => ({
        measurements: createDatabase(response)
    })
);

export const getMeasurements = (state: AppState) => getDatabaseItems(state.measurement.measurements);

export const measurementReducer = reducer;
