import {combineEpics} from 'redux-observable';
import {createSelectionAction, deleteSelectionAction, loadSelectionsAction, updateSelectionAction} from './actions';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import {createRequestEpic} from '../../../util/request';
import {getUser} from '../user/reducer';
import {getSelectedProject} from '../project/reducer';

const loadSelections = createRequestEpic(loadSelectionsAction, (action, state, deps) =>
    deps.client.loadSelections(getUser(state), getSelectedProject(state))
);
const createSelection = createRequestEpic(createSelectionAction, (action, state, deps) =>
    deps.client.createSelection(getUser(state), getSelectedProject(state), action.payload)
);
const updateSelection = createRequestEpic(updateSelectionAction, (action, state, deps) =>
    deps.client.updateSelection(getUser(state), action.payload)
);
const deleteSelection = createRequestEpic(deleteSelectionAction, (action, state, deps) =>
    deps.client.deleteSelection(getUser(state), action.payload)
);

export const selectionEpics = combineEpics(
    loadSelections,
    createSelection,
    updateSelection,
    deleteSelection
);
