import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {clearSelections, createSelectionAction, deleteSelectionAction, loadSelectionsAction,
    updateSelectionAction} from './actions';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {Selection} from '../../lib/measurement/selection/selection';
import {AppState} from '../app/reducers';
import {compose} from 'ramda';

export interface SelectionState
{
    selections: Selection[];
    selectionRequest: Request;
}

let reducer = reducerWithInitialState<SelectionState>({
    selections: [],
    selectionRequest: createRequest()
})
.case(clearSelections, state => ({
    ...state,
    selections: [],
    selectionRequest: createRequest()
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r,
        loadSelectionsAction,
        state => state.selectionRequest,
        (state, action) => ({
            selections: [...action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        createSelectionAction,
        state => state.selectionRequest,
        (state, action) => ({
            selections: [...state.selections, action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(reducer,
        updateSelectionAction,
        state => state.selectionRequest,
        (state, action) => ({
            selections: [...state.selections.filter(v => v.id !== action.payload.params.selection.id),
                action.payload.params.selection]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        deleteSelectionAction,
        state => state.selectionRequest,
        (state, action) => ({
            selections: state.selections.filter(v => v.id !== action.payload.params.selection.id)
        })
))(reducer);

export const getSelections = (state: AppState) => state.selection.selections;
export const getSelectionById = (selections: Selection[], id: string) => selections.find(sel => sel.id === id) || null;

export const selectionReducer = reducer;
