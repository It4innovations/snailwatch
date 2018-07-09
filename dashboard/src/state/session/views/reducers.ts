import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import moment from 'moment';
import {changeRangeFilterAction} from './actions';
import {BarChartPageState, barChartReducer} from './bar-chart-page/reducer';
import {LineChartPageState, lineChartReducer} from './line-chart-page/reducer';
import {combineReducers} from 'redux';
import {AppState} from '../../app/reducers';
import {MeasurementsPageState, measurementsReducer} from './measurements-page/reducer';
import {GridChartPageState, gridChartReducer} from './grid-chart-page/reducer';

interface GlobalState
{
    rangeFilter: RangeFilter;
}

export interface ViewsState
{
    barChartPage: BarChartPageState;
    lineChartPage: LineChartPageState;
    gridChartPage: GridChartPageState;
    measurementsPage: MeasurementsPageState;
    global: GlobalState;
}

const initialState: GlobalState = {
    rangeFilter: {
        from: moment().subtract(1, 'm'),
        to: moment(),
        entryCount: 1000,
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
    gridChartPage: gridChartReducer,
    measurementsPage: measurementsReducer,
    global: reducer
});
