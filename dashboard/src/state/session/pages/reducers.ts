import moment from 'moment';
import {combineReducers} from 'redux';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {RangeFilter} from '../../../lib/measurement/selection/range-filter';
import {AppState} from '../../app/reducers';
import {changeRangeFilterAction} from './actions';
import {ChartPageState, chartReducer} from './chart-page/reducer';
import {gridChartPageReducer, GridChartPageState} from './grid-chart-page/reducer';
import {MeasurementsPageState, measurementsReducer} from './measurements-page/reducer';

interface GlobalState
{
    rangeFilter: RangeFilter;
}

export interface PagesState
{
    chartState: ChartPageState;
    measurementsPage: MeasurementsPageState;
    gridChartPage: GridChartPageState;
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
    chartState: chartReducer,
    gridChartPage: gridChartPageReducer,
    measurementsPage: measurementsReducer,
    global: reducer
});
