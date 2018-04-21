import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import moment from 'moment';
import {changeRangeFilterAction} from './actions';
import {BarChartPageState, barChartReducer} from './bar-chart-page/reducer';
import {LineChartPageState, lineChartReducer} from './line-chart-page/reducer';
import {combineReducers} from 'redux';
import {AppState} from '../../app/reducers';

interface GlobalState
{
    rangeFilter: RangeFilter;
}

export interface ViewsState
{
    barChartPage: BarChartPageState;
    lineChartPage: LineChartPageState;
    global: GlobalState;
}

const initialState: GlobalState = {
    rangeFilter: {
        from: moment().subtract(1, 'w'),
        to: moment(),
        entryCount: 50,
        useDateFilter: false
    }
};
const reducer = reducerWithInitialState({ ...initialState })
.case(changeRangeFilterAction, (state, rangeFilter) => ({
    ...state,
    rangeFilter
}));

export const getRangeFilter = (state: AppState) => state.session.views.global.rangeFilter;

export const viewsReducer = combineReducers({
    barChartPage: barChartReducer,
    lineChartPage: lineChartReducer,
    global: reducer
});
