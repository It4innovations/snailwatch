import {combineEpics} from 'redux-observable';
import {createSelectionAction, deleteSelectionAction, loadSelectionsAction, updateSelectionAction} from './actions';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import {createRequestEpic} from '../../util/request';

const loadSelections = createRequestEpic(loadSelectionsAction, (action, state, deps) =>
    deps.client.loadSelections(action.payload.user, action.payload.project)
);
const createSelection = createRequestEpic(createSelectionAction, (action, state, deps) =>
    deps.client.createSelection(action.payload.user, action.payload.project, action.payload.selection)
);
const updateSelection = createRequestEpic(updateSelectionAction, (action, state, deps) =>
    deps.client.updateSelection(action.payload.user, action.payload.selection)
);
const deleteSelection = createRequestEpic(deleteSelectionAction, (action, state, deps) =>
    deps.client.deleteSelection(action.payload.user, action.payload.selection)
);

export const viewEpics = combineEpics(
    loadSelections,
    createSelection,
    updateSelection,
    deleteSelection
);
