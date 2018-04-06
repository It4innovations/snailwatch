import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Measurement} from '../../../lib/measurement/measurement';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {compose} from 'ramda';
import {
    loadBarChartMeasurementsAction,
    setBarChartSelection,
    setBarChartXAxisAction,
    setBarChartYAxesAction
} from './actions';
import {Selection} from '../../../lib/measurement/selection/selection';

export interface BarChartPageState
{
    measurements: Measurement[];
    measurementsRequest: Request;
    selection: Selection | null;
    xAxis: string;
    yAxes: string[];
}

let reducer = reducerWithInitialState({
    measurements: [],
    measurementsRequest: createRequest(),
    selection: null,
    xAxis: '',
    yAxes: []
})
.case(setBarChartXAxisAction, (state, xAxis) => ({...state, xAxis }))
.case(setBarChartYAxesAction, (state, yAxes) => ({...state, yAxes }))
.case(setBarChartSelection, (state, selection) => ({...state, selection }));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loadBarChartMeasurementsAction,
        (state: BarChartPageState) => state.measurementsRequest,
        (state: BarChartPageState, action) => ({
            measurements: action.payload.result
        })
    )
)(reducer);

export const barChartReducer = reducer;
