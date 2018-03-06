import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {clearViews, createView, deleteView, loadViews, selectView, updateView} from './actions';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {View} from '../../lib/view/view';
import {find} from 'ramda';
import {AppState} from '../app/reducers';
import {compose} from 'ramda';

function selectNewView(views: View[]): string
{
    if (views.length === 0) return null;
    return views[0].id;
}

export interface ViewState
{
    views: View[];
    selectedView: string | null;
    viewRequest: Request;
}

let reducer = reducerWithInitialState<ViewState>({
    views: [],
    selectedView: null,
    viewRequest: createRequest()
})
.case(selectView, (state, selectedView) => ({
    ...state,
    selectedView
}))
.case(clearViews, state => ({
    ...state,
    views: [],
    selectedView: null,
    viewRequest: createRequest()
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r,
        loadViews,
        state => state.viewRequest,
        (state: ViewState, action) => ({
            views: [...action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        createView,
        (state: ViewState) => state.viewRequest,
        (state: ViewState, action) => ({
            views: [...state.views, action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(reducer,
        updateView,
        (state: ViewState) => state.viewRequest,
        (state: ViewState, action) => ({
            views: [...state.views.filter(v => v.id !== action.payload.params.view.id), action.payload.params.view]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        deleteView,
        (state: ViewState) => state.viewRequest,
        (state: ViewState, action) => {
            const deleteSelected = state.selectedView === action.payload.params.view.id;
            const views = [...state.views.filter(v => v.id !== action.payload.params.view.id)];
            const selectedView = deleteSelected ? selectNewView(views) : state.selectedView;

            return {
                views,
                selectedView
            };
        }
))(reducer);

export const getViews = (state: AppState) => state.view.views;
export const getSelectedView = (state: AppState) => {
    if (state.view.selectedView === null) return null;
    const view = find(v => v.id === state.view.selectedView, getViews(state));
    if (view === undefined) return null;
    return view;
};

export const viewReducer = reducer;
