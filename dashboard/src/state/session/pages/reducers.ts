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

export interface PagesState
{
    barChartPage: BarChartPageState;
    lineChartPage: LineChartPageState;
    gridChartPage: GridChartPageState;
    measurementsPage: MeasurementsPageState;
    global: GlobalState;
}

export const initialState: GlobalState = {
    rangeFilter: {
        from: moment().subtract(1, 'M'),
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

export const getRangeFilter = (state: AppState) => state.session.pages.global.rangeFilter;

export const pagesReducer = combineReducers({
    barChartPage: barChartReducer,
    lineChartPage: lineChartReducer,
    gridChartPage: gridChartReducer,
    measurementsPage: measurementsReducer,
    global: reducer
});
