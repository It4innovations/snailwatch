import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {AppState} from '../app/reducers';
import {Measurement} from '../../lib/measurement/measurement';
import {clearMeasurements, deleteMeasurement, loadMeasurements} from './actions';
import {createDatabase, Database, deleteFromDatabase, getDatabaseItems, mergeDatabase} from '../../util/database';
import {compose} from 'ramda';

export interface MeasurementState
{
    measurements: Database<Measurement>;
    totalMeasurements: number;
    loadMeasurementsRequest: Request;
    deleteMeasurementRequest: Request;
}

let reducer = reducerWithInitialState<MeasurementState>({
    measurements: createDatabase(),
    totalMeasurements: 0,
    loadMeasurementsRequest: createRequest(),
    deleteMeasurementRequest: createRequest()
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
), (r: typeof reducer) => hookRequestActions(r, deleteMeasurement,
        (state: MeasurementState) => state.deleteMeasurementRequest,
        (state: MeasurementState, action) => ({
            measurements: deleteFromDatabase(state.measurements, action.payload.params.measurement.id),
            totalMeasurements: state.totalMeasurements - 1
        })
))(reducer);

export const getMeasurements = (state: AppState) => getDatabaseItems(state.measurement.measurements);
export const getTotalMeasurements = (state: AppState) => state.measurement.totalMeasurements;

export const measurementReducer = reducer;
