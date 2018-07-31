import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../../../util/request';
import {LineChartDataset} from '../../../../components/charts/chart/line-chart/line-chart-dataset';
import {setGridChartXAxisAction, loadGridChartDatasetsAction, setGridChartYAxisAction} from './actions';
import {compose} from 'ramda';
import {clearSession} from '../../actions';
import {AppState} from '../../../app/reducers';

export interface GridChartPageState
{
    measurementsRequest: Request;
    datasets: LineChartDataset[];
    xAxis: string;
    yAxis: string;
}

const initialState: GridChartPageState = {
    measurementsRequest: createRequest(),
    datasets: [],
    xAxis: '',
    yAxis: ''
};

let reducer = reducerWithInitialState<GridChartPageState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(setGridChartXAxisAction, (state, xAxis) => ({ ...state, xAxis }))
.case(setGridChartYAxisAction, (state, yAxis) => ({ ...state, yAxis }));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loadGridChartDatasetsAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            datasets: [...action.payload.result]
        })
    )
)(reducer);

const getGridChartPage = (state: AppState): GridChartPageState => state.session.pages.gridChartPage;
export const getGridChartXAxis = (state: AppState) => getGridChartPage(state).xAxis;
export const getGridChartYAxis = (state: AppState) => getGridChartPage(state).yAxis;
export const getGridChartDatasets = (state: AppState) => getGridChartPage(state).datasets;

export const gridChartReducer = reducer;
