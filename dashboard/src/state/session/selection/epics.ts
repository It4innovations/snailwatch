import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../util/request';
import {getSelectedProject} from '../project/reducer';
import {getUser} from '../user/reducer';
import {SelectionActions} from './actions';

const loadSelections = createRequestEpic(SelectionActions.load, (action, state, deps) => {
    throw new Error('Invalid direct selection load, use ViewActions.load');
    return deps.client.loadSelections(getUser(state), getSelectedProject(state));
});
const createSelection = createRequestEpic(SelectionActions.create, (action, state, deps) =>
    deps.client.createSelection(getUser(state), getSelectedProject(state), action.payload)
);
const updateSelection = createRequestEpic(SelectionActions.update, (action, state, deps) =>
    deps.client.updateSelection(getUser(state), action.payload)
);
const deleteSelection = createRequestEpic(SelectionActions.delete, (action, state, deps) =>
    deps.client.deleteSelection(getUser(state), action.payload)
);

export const selectionEpics = combineEpics(
    loadSelections,
    createSelection,
    updateSelection,
    deleteSelection
);
