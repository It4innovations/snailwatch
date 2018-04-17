import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {LineChartDataset} from '../../../components/visualisation/chart/line-chart/line-chart-dataset';
import {
    deleteLineChartDatasetAction,
    setLineChartXAxisAction,
    updateLineChartDatasetAction,
    addLineChartDatasetAction, reloadDatasetsAction
} from './actions';
import {compose, update, max, reduce} from 'ramda';

export interface LineChartPageState
{
    measurementsRequest: Request;
    datasets: LineChartDataset[];
    xAxis: string;
}

function assignDatasetName(datasets: LineChartDataset[], dataset: LineChartDataset): LineChartDataset
{
    const highest = reduce<number, number>(max, 0, datasets.map(d => Number(d.name)));

    return {
        ...dataset,
        name: (highest + 1).toString()
    };
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
            datasets: [...state.datasets, assignDatasetName(state.datasets, action.payload.result)]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r, reloadDatasetsAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: action.payload.result
        })
    )
)(reducer);

export const lineChartReducer = reducer;
