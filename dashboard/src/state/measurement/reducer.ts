import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {deleteMeasurement} from './actions';
import {compose} from 'ramda';

export interface MeasurementState
{
    deleteMeasurementRequest: Request;
}

let reducer = reducerWithInitialState<MeasurementState>({
    deleteMeasurementRequest: createRequest()
});

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, deleteMeasurement,
        state => state.deleteMeasurementRequest
))(reducer);

export const measurementReducer = reducer;
