import {combineEpics} from 'redux-observable';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import {createRequestEpic} from '../../../util/request';
import {ViewActions} from './actions';
import {getUser} from '../user/reducer';
import {getSelectedProject} from '../project/reducer';

const loadAnalyses = createRequestEpic(ViewActions.load, (action, state, deps) =>
    deps.client.loadViews(getUser(state), getSelectedProject(state))
);
const createAnalysis = createRequestEpic(ViewActions.create, (action, state, deps) =>
    deps.client.createViews(getUser(state), getSelectedProject(state), action.payload)
);
const updateAnalysis = createRequestEpic(ViewActions.update, (action, state, deps) =>
    deps.client.updateViews(getUser(state), action.payload)
);
const deleteAnalysis = createRequestEpic(ViewActions.delete, (action, state, deps) =>
    deps.client.deleteViews(getUser(state), action.payload)
);

export const analysisEpics = combineEpics(
    loadAnalyses,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis
);
