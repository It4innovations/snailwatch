import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {AppState} from '../app/reducers';
import {Measurement} from '../../lib/measurement/measurement';
import {clearMeasurements, loadMeasurements} from './actions';
import {createDatabase, Database, getDatabaseItems, mergeDatabase} from '../../util/database';

export interface MeasurementState
{
    measurements: Database<Measurement>;
    totalMeasurements: number;
    loadMeasurementsRequest: Request;
}

let reducer = reducerWithInitialState<MeasurementState>({
    measurements: createDatabase(),
    totalMeasurements: 0,
    loadMeasurementsRequest: createRequest()
})
.case(clearMeasurements, (state) => ({
    ...state,
    measurements: createDatabase()
}));

reducer = hookRequestActions(reducer, loadMeasurements,
    (state: MeasurementState) => state.loadMeasurementsRequest,
    (state: MeasurementState, response) => ({
        measurements: mergeDatabase(state.measurements, response.items),
        totalMeasurements: response.total
    })
);

export const getMeasurements = (state: AppState) => getDatabaseItems(state.measurement.measurements);

export const measurementReducer = reducer;
