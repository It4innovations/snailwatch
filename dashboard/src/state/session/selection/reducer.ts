import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Selection} from '../../../lib/measurement/selection/selection';
import {createCrudReducer} from '../../../util/crud';
import {createRequest, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {clearSession} from '../actions';
import {SelectionActions} from './actions';

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

reducer = createCrudReducer<SelectionState, Selection>(
    reducer,
    SelectionActions,
    'selections',
    state => state.selectionRequest,
);

export const getSelections = (state: AppState) => state.session.selection.selections;
export const getSelectionById = (selections: Selection[], id: string) => selections.find(sel => sel.id === id) || null;

export const selectionReducer = reducer;
