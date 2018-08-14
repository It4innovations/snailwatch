import {compose} from 'ramda';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Measurement} from '../../../../lib/measurement/measurement';
import {createRequest, hookRequestActions, Request} from '../../../../util/request';
import {clearSession} from '../../actions';
import {loadGridChartMeasurements} from './actions';

export interface GridChartPageState
{
    measurementsRequest: Request;
    measurements: Measurement[];
}

const initialState: GridChartPageState = {
    measurementsRequest: createRequest(),
    measurements: []
};

let reducer = reducerWithInitialState<GridChartPageState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loadGridChartMeasurements,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            measurements: action.payload.result
        })
    )
)(reducer);

export const gridChartPageReducer = reducer;
