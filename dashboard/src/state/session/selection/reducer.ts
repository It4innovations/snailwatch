import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createSelectionAction, deleteSelectionAction, loadSelectionsAction,
    updateSelectionAction} from './actions';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {Selection} from '../../../lib/measurement/selection/selection';
import {AppState} from '../../app/reducers';
import {compose} from 'ramda';
import {clearSession} from '../actions';

export interface SelectionState
{
    selections: Selection[];
    selectionRequest: Request;
}

const initialState: SelectionState = {
    selections: [],
    selectionRequest: createRequest()
};

let reducer = reducerWithInitialState<SelectionState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }));

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

export const getSelections = (state: AppState) => state.session.selection.selections;
export const getSelectionById = (selections: Selection[], id: string) => selections.find(sel => sel.id === id) || null;

export const selectionReducer = reducer;
