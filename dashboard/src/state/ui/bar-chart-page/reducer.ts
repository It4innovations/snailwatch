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
import {AppState} from '../../app/reducers';

export interface BarChartPageState
{
    measurements: Measurement[];
    measurementsRequest: Request;
    selectionId: string | null;
    xAxis: string;
    yAxes: string[];
}

let reducer = reducerWithInitialState<BarChartPageState>({
    measurements: [],
    measurementsRequest: createRequest(),
    selectionId: null,
    xAxis: '',
    yAxes: []
})
.case(setBarChartXAxisAction, (state, xAxis) => ({...state, xAxis }))
.case(setBarChartYAxesAction, (state, yAxes) => ({...state, yAxes }))
.case(setBarChartSelection, (state, selectionId) => ({...state, selectionId }));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loadBarChartMeasurementsAction,
        state => state.measurementsRequest,
        (state, action) => ({
            measurements: action.payload.result
        })
    )
)(reducer);

export const getBarChartPageSelection = (state: AppState) => state.selection.selections.find(sel =>
    sel.id === state.ui.barChartPage.selectionId) || null;

export const barChartReducer = reducer;
