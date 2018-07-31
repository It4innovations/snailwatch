import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../../../util/request';
import {LineChartDataset} from '../../../../components/visualisation/chart/line-chart/line-chart-dataset';
import {
    deleteLineChartDatasetAction,
    setLineChartXAxisAction,
    updateLineChartDatasetAction,
    addLineChartDatasetAction, reloadLineChartDatasetsAction, selectLineChartDatasetAction
} from './actions';
import {compose, indexBy, update} from 'ramda';
import {clearSession} from '../../actions';

export interface LineChartPageState
{
    measurementsRequest: Request;
    datasets: LineChartDataset[];
    xAxis: string;
}

const initialState: LineChartPageState = {
    measurementsRequest: createRequest(),
    datasets: [],
    xAxis: ''
};

let reducer = reducerWithInitialState<LineChartPageState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(setLineChartXAxisAction, (state, xAxis) => ({ ...state, xAxis }))
.case(deleteLineChartDatasetAction, (state, dataset) => ({
    ...state,
    datasets: state.datasets.filter(d => d.id !== dataset.id)
}))
.case(selectLineChartDatasetAction, (state, action) => ({
    ...state,
    datasets: [action.dataset],
    xAxis: action.xAxis
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, updateLineChartDatasetAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: update(state.datasets.findIndex(d => d.id === action.payload.params.dataset.id),
                action.payload.result, state.datasets)
        })
    ),
    (r: typeof reducer) => hookRequestActions(r, addLineChartDatasetAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: [...state.datasets, action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r, reloadLineChartDatasetsAction,
        state => state.measurementsRequest,
        (state, action) => {
            const byId = indexBy(d => d.id, action.payload.result);

            return {
                ...state,
                datasets: state.datasets.map(d => ({
                    ...d,
                    measurements: byId[d.id] ? byId[d.id].measurements : d.measurements
                }))
            };
        }
    )
)(reducer);

export const lineChartReducer = reducer;
