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
        (state: SelectionState, action) => ({
            selections: [...action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        createSelectionAction,
        (state: SelectionState) => state.selectionRequest,
        (state: SelectionState, action) => ({
            selections: [...state.selections, action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(reducer,
        updateSelectionAction,
        (state: SelectionState) => state.selectionRequest,
        (state: SelectionState, action) => ({
            selections: [...state.selections.filter(v => v.id !== action.payload.params.selection.id),
                action.payload.params.selection]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        deleteSelectionAction,
        (state: SelectionState) => state.selectionRequest,
        (state: SelectionState, action) => {
            const selections = [...state.selections.filter(v => v.id !== action.payload.params.selection.id)];

            return {
                selections
            };
        }
))(reducer);

export const getSelections = (state: AppState) => state.selection.selections;

export const selectionReducer = reducer;
