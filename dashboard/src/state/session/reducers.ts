import {userReducer, UserState} from './user/reducer';
import {combineReducers} from 'redux';
import {projectReducer, ProjectState} from './project/reducer';
import {selectionReducer, SelectionState} from './selection/reducer';
import {pagesReducer, PagesState} from './pages/reducers';
import {analysisReducer, AnalysisState} from './analysis/reducer';

export interface SessionState
{
    user: UserState;
    project: ProjectState;
    analysis: AnalysisState;
    selection: SelectionState;
    pages: PagesState;
}

export const sessionReducer = combineReducers({
    user: userReducer,
    project: projectReducer,
    analysis: analysisReducer,
    selection: selectionReducer,
    pages: pagesReducer
});
