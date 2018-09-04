import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, Request} from '../../../../util/request';
import {clearSession} from '../../actions';
import {ViewActions} from '../../view/actions';
import {setChartXAxisAction, updateSelectedViewsAction} from './actions';

export interface ChartPageState
{
    measurementsRequest: Request;
    selectedViews: string[];
    xAxis: string;
}

const initialState: ChartPageState = {
    measurementsRequest: createRequest(),
    selectedViews: [],
    xAxis: ''
};

let reducer = reducerWithInitialState<ChartPageState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(setChartXAxisAction, (state, xAxis) => ({ ...state, xAxis }))
.case(updateSelectedViewsAction, (state, selectedViews) => ({ ...state, selectedViews }))
.case(ViewActions.load.done, (state, action) => ({
    ...state,
    selectedViews: state.selectedViews.filter(d => action.result.find(v => v.id === d) !== undefined)
}))
.case(ViewActions.delete.done, (state, action) => ({
    ...state,
    selectedViews: state.selectedViews.filter(d => d !== action.params.id)
}));

export const chartReducer = reducer;
