import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {View} from '../../../lib/view/view';
import {createCrudReducer} from '../../../util/crud';
import {createRequest, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {clearSession} from '../actions';
import {reloadViewMeasurementsAction} from '../pages/chart-page/actions';
import {deleteAllMeasurementsAction, deleteMeasurementAction} from '../pages/measurements-page/actions';
import {ViewActions} from './actions';

export interface ViewState
{
    views: View[];
    viewRequest: Request;
}

const initialState: ViewState = {
    views: [],
    viewRequest: createRequest()
};

let reducers = reducerWithInitialState<ViewState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }))
.case(reloadViewMeasurementsAction.done, (state, action) => ({
    ...state,
    views: action.result
}))
.case(deleteMeasurementAction.done, (state, action) => ({
    ...state,
    views: state.views.map(v => ({
        ...v,
        measurements: v.measurements.filter(m => m.id !== action.params.id)
    }))
}))
.case(deleteAllMeasurementsAction.done, state => ({
    ...state,
    views: state.views.map(v => ({
        ...v,
        measurements: []
    }))
}));

reducers = createCrudReducer<ViewState, View>(
    reducers,
    ViewActions,
    'views',
    state => state.viewRequest
);

export const getViewsState = (state: AppState) => state.session.view;
export const getViews = (state: AppState) => getViewsState(state).views;
export const getViewById = (views: View[], id: string) =>
    views.find(view => view.id === id) || null;

export const viewReducer = reducers;
