import {combineEpics} from 'redux-observable';
import {createView, deleteView, loadViews, updateView} from './actions';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import {createRequestEpic} from '../../util/request';

const loadViewsEpic = createRequestEpic(loadViews, (action, state, deps) =>
    deps.client.loadViews(action.payload.user, action.payload.project)
);
const createViewEpic = createRequestEpic(createView, (action, state, deps) =>
    deps.client.createView(action.payload.user, action.payload.project, action.payload.view)
);
const updateViewEpic = createRequestEpic(updateView, (action, state, deps) =>
    deps.client.updateView(action.payload.user, action.payload.view)
);
const deleteViewEpic = createRequestEpic(deleteView, (action, state, deps) =>
    deps.client.deleteView(action.payload.user, action.payload.view)
);

export const viewEpics = combineEpics(
    loadViewsEpic,
    createViewEpic,
    updateViewEpic,
    deleteViewEpic
);
