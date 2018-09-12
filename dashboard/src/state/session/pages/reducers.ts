import moment from 'moment';
import {compose} from 'ramda';
import {combineReducers} from 'redux';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Measurement} from '../../../lib/measurement/measurement';
import {RangeFilter} from '../../../lib/view/range-filter';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {changeRangeFilterAction, loadGlobalMeasurements} from './actions';
import {ChartPageState, chartReducer} from './chart-page/reducer';
import {gridChartPageReducer, GridChartPageState} from './grid-chart-page/reducer';
import {MeasurementsPageState, measurementsReducer} from './measurements-page/reducer';

interface GlobalState
{
    rangeFilter: RangeFilter;
    measurements: Measurement[];
    measurementsRequest: Request;
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
        entryCount: 100,
        useDateFilter: false
    },
    measurements: [],
    measurementsRequest: createRequest()
};
let reducer = reducerWithInitialState({ ...initialState })
.case(changeRangeFilterAction, (state, rangeFilter) => ({
    ...state,
    rangeFilter
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loadGlobalMeasurements,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            measurements: action.payload.result
        })
    )
)(reducer);

export const getRangeFilter = (state: AppState) => state.session.pages.global.rangeFilter;
export const getGlobalMeasurements = (state: AppState) => state.session.pages.global.measurements;

export const pagesReducer = combineReducers({
    chartState: chartReducer,
    gridChartPage: gridChartPageReducer,
    measurementsPage: measurementsReducer,
    global: reducer
});
