import {compose} from 'redux';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {DATE_FORMAT_DAY} from '../../../../components/charts/chart/date-format';
import {LineChartSettings} from '../../../../components/charts/chart/line-chart/line-chart-settings';
import {XAxisSettings} from '../../../../components/charts/chart/x-axis-settings';
import {createRequest, hookRequestActions, Request} from '../../../../util/request';
import {AppState} from '../../../app/reducers';
import {clearSession} from '../../actions';
import {ViewActions} from '../../view/actions';
import {
    reloadViewMeasurementsAction,
    updateChartXAxisSettingsAction,
    updateLineChartSettings,
    updateSelectedViewsAction
} from './actions';

export interface ChartPageState
{
    measurementsRequest: Request;
    selectedViews: string[];
    xAxisSettings: XAxisSettings;
    lineChartSettings: LineChartSettings;
}

const initialState: ChartPageState = {
    measurementsRequest: createRequest(),
    selectedViews: [],
    xAxisSettings: {
        xAxis: '',
        dateFormat: DATE_FORMAT_DAY
    },
    lineChartSettings: {
        connectPoints: true,
        showPoints: false,
        showAverageTrend: false,
        showErrorBars: false
    }
};

let reducer = reducerWithInitialState<ChartPageState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(updateChartXAxisSettingsAction, (state, xAxisSettings) => ({ ...state, xAxisSettings }))
.case(updateSelectedViewsAction, (state, selectedViews) => ({ ...state, selectedViews }))
.case(updateLineChartSettings, (state, lineChartSettings) => ({ ...state, lineChartSettings }))
.case(ViewActions.load.done, (state, action) => ({
    ...state,
    selectedViews: state.selectedViews.filter(d => action.result.find(v => v.id === d) !== undefined)
}))
.case(ViewActions.delete.done, (state, action) => ({
    ...state,
    selectedViews: state.selectedViews.filter(d => d !== action.params.id)
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, reloadViewMeasurementsAction,
        state => state.measurementsRequest
    )
)(reducer);

export const getChartState = (state: AppState) => state.session.pages.chartState;

export const chartReducer = reducer;
