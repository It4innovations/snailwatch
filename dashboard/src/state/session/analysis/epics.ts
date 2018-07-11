import {combineEpics} from 'redux-observable';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import {createRequestEpic} from '../../../util/request';
import {createAnalysisAction, deleteAnalysisAction, loadAnalysesAction, updateAnalysisAction} from './actions';
import {getUser} from '../user/reducer';
import {getSelectedProject} from '../project/reducer';

const loadAnalyses = createRequestEpic(loadAnalysesAction, (action, state, deps) =>
    deps.client.loadAnalyses(getUser(state), getSelectedProject(state))
);
const createAnalysis = createRequestEpic(createAnalysisAction, (action, state, deps) =>
    deps.client.createAnalysis(getUser(state), getSelectedProject(state), action.payload)
);
const updateAnalysis = createRequestEpic(updateAnalysisAction, (action, state, deps) =>
    deps.client.updateAnalysis(getUser(state), action.payload)
);
const deleteAnalysis = createRequestEpic(deleteAnalysisAction, (action, state, deps) =>
    deps.client.deleteAnalysis(getUser(state), action.payload)
);

export const analysisEpics = combineEpics(
    loadAnalyses,
    createAnalysis,
    updateAnalysis,
    deleteAnalysis
);
