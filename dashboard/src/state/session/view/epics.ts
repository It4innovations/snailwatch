import {combineEpics} from 'redux-observable';
import {of} from 'rxjs';
import {createRequestEpic, createRequestEpicOptimistic} from '../../../util/request';
import {getSelectedProject} from '../project/reducers';
import {getToken} from '../user/reducers';
import {ViewActions} from './actions';
import {getViewById, getViews} from './reducers';

const loadViews = createRequestEpic(ViewActions.load, (action, store, deps) =>
    deps.client.loadViews(getToken(store.value), getSelectedProject(store.value))
);
const createView = createRequestEpic(ViewActions.create, (action, store, deps) =>
    deps.client.createView(getToken(store.value), getSelectedProject(store.value), action.payload)
);
const updateView = createRequestEpicOptimistic(ViewActions.update, (action, store, deps) =>
    deps.client.updateView(getToken(store.value), action.payload),
    (action) => action.payload,
    (action, state) => of(ViewActions.update.done({
        params: action.payload,
        result: getViewById(getViews(state), action.payload.id)
    }))
);
const deleteView = createRequestEpicOptimistic(ViewActions.delete, (action, store, deps) =>
    deps.client.deleteView(getToken(store.value), action.payload),
    () => true,
    (action) => of(ViewActions.create.done({
        params: action.payload,
        result: action.payload
    }))
);

export const viewEpics = combineEpics(
    loadViews,
    createView,
    updateView,
    deleteView
);
