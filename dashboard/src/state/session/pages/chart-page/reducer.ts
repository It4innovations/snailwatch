import {compose, indexBy, update} from 'ramda';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {ChartDataset} from '../../../../components/charts/chart/chart-dataset';
import {createRequest, hookRequestActions, Request} from '../../../../util/request';
import {clearSession} from '../../actions';
import {ViewActions} from '../../view/actions';
import {
    addChartDatasetAction,
    deleteChartDatasetAction,
    reloadChartDatasetsAction,
    selectChartViewAction,
    setChartXAxisAction,
    updateChartDatasetAction
} from './actions';

export interface ChartPageState
{
    measurementsRequest: Request;
    datasets: ChartDataset[];
    xAxis: string;
}

const initialState: ChartPageState = {
    measurementsRequest: createRequest(),
    datasets: [],
    xAxis: ''
};

let reducer = reducerWithInitialState<ChartPageState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(setChartXAxisAction, (state, xAxis) => ({ ...state, xAxis }))
.case(deleteChartDatasetAction, (state, dataset) => ({
    ...state,
    datasets: state.datasets.filter(d => d.id !== dataset.id)
}))
.case(selectChartViewAction, (state, action) => ({
    ...state,
    datasets: [{
        id: '1',
        view: action.view.name,
        xAxis: action.xAxis,
        measurements: []
    }],
    xAxis: action.xAxis
}))
.case(ViewActions.delete.done, (state, view) => ({
    ...state,
    datasets: state.datasets.filter(d => d.view !== view.params.id)
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, updateChartDatasetAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: update(state.datasets.findIndex(d => d.id === action.payload.params.dataset.id),
                action.payload.result, state.datasets)
        })
    ),
    (r: typeof reducer) => hookRequestActions(r, addChartDatasetAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: [...state.datasets, action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r, reloadChartDatasetsAction,
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

export const chartReducer = reducer;
