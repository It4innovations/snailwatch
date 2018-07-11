import {combineEpics} from 'redux-observable';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import {createRequestEpic} from '../../../util/request';
import {AnalysisActions} from './actions';
import {getUser} from '../user/reducer';
import {getSelectedProject} from '../project/reducer';

const loadAnalyses = createRequestEpic(AnalysisActions.load, (action, state, deps) =>
    deps.client.loadAnalyses(getUser(state), getSelectedProject(state))
);
const createAnalysis = createRequestEpic(AnalysisActions.create, (action, state, deps) =>
    deps.client.createAnalysis(getUser(state), getSelectedProject(state), action.payload)
);
const updateAnalysis = createRequestEpic(AnalysisActions.update, (action, state, deps) =>
    deps.client.updateAnalysis(getUser(state), action.payload)
);
const deleteAnalysis = createRequestEpic(AnalysisActions.delete, (action, state, deps) =>
    deps.client.deleteAnalysis(getUser(state), action.payload)
);

export const analysisEpics = combineEpics(
    loadAnalyses,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis
);
