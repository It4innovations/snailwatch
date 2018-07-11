import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {AnalysisActions} from './actions';
import {createRequest, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {clearSession} from '../actions';
import {Analysis} from '../../../lib/analysis/analysis';
import {createCrudReducer} from '../../../util/crud';

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

reducer = createCrudReducer<AnalysisState, Analysis>(
    reducer,
    AnalysisActions,
    'analyses',
    state => state.analysisRequest,
);

export const getAnalyses = (state: AppState) => state.session.analysis.analyses;
export const getAnalysisById = (analyses: Analysis[], id: string) =>
    analyses.find(analysis => analysis.id === id) || null;

export const analysisReducer = reducer;
