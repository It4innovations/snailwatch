import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {LineChartDataset} from '../../../components/visualisation/line-chart/line-chart-dataset';
import {
    deleteLineChartDatasetAction,
    setLineChartXAxisAction,
    updateLineChartDatasetAction,
    addLineChartDatasetAction
} from './actions';
import {compose, update} from 'ramda';

export interface LineChartPageState
{
    measurementsRequest: Request;
    datasets: LineChartDataset[];
    xAxis: string;
}

let reducer = reducerWithInitialState<LineChartPageState>({
    measurementsRequest: createRequest(),
    datasets: [],
    xAxis: ''
})
.case(setLineChartXAxisAction, (state, xAxis) => ({ ...state, xAxis }))
.case(deleteLineChartDatasetAction, (state, dataset) => ({
    ...state,
    datasets: state.datasets.filter(d => d !== dataset)
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, updateLineChartDatasetAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: update(state.datasets.findIndex(d => d === action.payload.params.dataset),
                action.payload.result, state.datasets)
        })
    ),
    (r: typeof reducer) => hookRequestActions(r, addLineChartDatasetAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: [...state.datasets, action.payload.result]
        })
    )
)(reducer);

export const lineChartReducer = reducer;
