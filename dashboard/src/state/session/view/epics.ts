import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../util/request';
import {getSelectedProject} from '../project/reducer';
import {getToken} from '../user/reducer';
import {ViewActions} from './actions';

const loadViews = createRequestEpic(ViewActions.load, (action, state, deps) =>
    deps.client.loadViews(getToken(state), getSelectedProject(state))
);
const createView = createRequestEpic(ViewActions.create, (action, state, deps) =>
    deps.client.createView(getToken(state), getSelectedProject(state), action.payload)
);
const updateView = createRequestEpic(ViewActions.update, (action, state, deps) =>
    deps.client.updateView(getToken(state), action.payload)
);
const deleteView = createRequestEpic(ViewActions.delete, (action, state, deps) =>
    deps.client.deleteView(getToken(state), action.payload)
);

export const viewEpics = combineEpics(
    loadViews,
    createView,
    updateView,
    deleteView
);
