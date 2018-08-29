import {compose} from 'ramda';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Measurement} from '../../../../lib/measurement/measurement';
import {createRequest, hookRequestActions, Request} from '../../../../util/request';
import {AppState} from '../../../app/reducers';
import {getViewById, getViews} from '../../view/reducer';
import {deleteMeasurementAction, loadMeasurementsAction, setMeasurementsViewAction} from './actions';

export interface MeasurementsPageState
{
    measurementsRequest: Request;
    measurements: Measurement[];
    viewId: string | null;
}

const initialState: MeasurementsPageState = {
    measurementsRequest: createRequest(),
    measurements: [],
    viewId: null
};

let reducer = reducerWithInitialState<MeasurementsPageState>({ ...initialState })
.case(setMeasurementsViewAction, (state, viewId) => ({
    ...state,
    viewId
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loadMeasurementsAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            measurements: action.payload.result
        })
    ),
    (r: typeof reducer) => hookRequestActions(r, deleteMeasurementAction,
        state => state.measurementsRequest,
        (state, action) => ({
            ...state,
            measurements: state.measurements.filter(m => m.id !== action.payload.params.id)
        })
    )
)(reducer);

export const getMeasurementsPageView = (state: AppState) => getViewById(getViews(state),
    state.session.pages.measurementsPage.viewId);

export const measurementsReducer = reducer;
