import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {createAnalysisAction, deleteAnalysisAction, loadAnalysesAction, updateAnalysisAction} from './actions';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {compose} from 'ramda';
import {clearSession} from '../actions';
import {Analysis} from '../../../lib/analysis/analysis';

export interface AnalysisState
{
    analyses: Analysis[];
    analysisRequest: Request;
}

const initialState: AnalysisState = {
    analyses: [],
    analysisRequest: createRequest()
};

let reducer = reducerWithInitialState<AnalysisState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r,
        loadAnalysesAction,
        state => state.analysisRequest,
        (state, action) => ({
            analyses: [...action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        createAnalysisAction,
        state => state.analysisRequest,
        (state, action) => ({
            analyses: [...state.analyses, action.payload.result]
        })
    ),
    (r: typeof reducer) => hookRequestActions(reducer,
        updateAnalysisAction,
        state => state.analysisRequest,
        (state, action) => ({
            analyses: [...state.analyses.filter(v => v.id !== action.payload.params.id),
                action.payload.params]
        })
    ),
    (r: typeof reducer) => hookRequestActions(r,
        deleteAnalysisAction,
        state => state.analysisRequest,
        (state, action) => ({
            analyses: state.analyses.filter(v => v.id !== action.payload.params.id)
        })
))(reducer);

export const getAnalyses = (state: AppState) => state.session.analysis.analyses;
export const getAnalysisById = (analyses: Analysis[], id: string) =>
    analyses.find(analysis => analysis.id === id) || null;

export const analysisReducer = reducer;
