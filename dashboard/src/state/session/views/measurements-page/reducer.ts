import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createRequest, hookRequestActions, Request} from '../../../../util/request';
import {loadMeasurementsAction, deleteMeasurementAction, setMeasurementsSelectionAction} from './actions';
import {compose} from 'ramda';
import {Measurement} from '../../../../lib/measurement/measurement';
import {getSelectionById, getSelections} from '../../selection/reducer';
import {AppState} from '../../../app/reducers';

export interface MeasurementsPageState
{
    measurementsRequest: Request;
    measurements: Measurement[];
    selectionId: string | null;
}

const initialState: MeasurementsPageState = {
    measurementsRequest: createRequest(),
    measurements: [],
    selectionId: null
};

let reducer = reducerWithInitialState<MeasurementsPageState>({ ...initialState })
.case(setMeasurementsSelectionAction, (state, selectionId) => ({
    ...state,
    selectionId
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

export const getMeasurementsPageSelection = (state: AppState) => getSelectionById(getSelections(state),
    state.session.views.measurementsPage.selectionId);

export const measurementsReducer = reducer;
