import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {AppState} from '../app/reducers';
import {Measurement} from '../../lib/measurement/measurement';
import {clearMeasurements, loadMeasurements} from './actions';
import {createDatabase, Database, getDatabaseItems, mergeDatabase} from '../../util/database';
import {compose} from 'ramda';

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

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loadMeasurements,
        (state: MeasurementState) => state.loadMeasurementsRequest,
        (state: MeasurementState, action) => ({
            measurements: action.payload.params.reload ?
                createDatabase(action.payload.result.items) :
                mergeDatabase(state.measurements, action.payload.result.items),
            totalMeasurements: action.payload.result.total
        })
))(reducer);

export const getMeasurements = (state: AppState) => getDatabaseItems(state.measurement.measurements);
export const getTotalMeasurements = (state: AppState) => state.measurement.totalMeasurements;

export const measurementReducer = reducer;
