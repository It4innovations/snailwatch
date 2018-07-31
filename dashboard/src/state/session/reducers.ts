import {userReducer, UserState} from './user/reducer';
import {combineReducers} from 'redux';
import {projectReducer, ProjectState} from './project/reducer';
import {selectionReducer, SelectionState} from './selection/reducer';
import {pagesReducer, PagesState} from './pages/reducers';
import {viewReducer, ViewState} from './view/reducer';

export interface SessionState
{
    user: UserState;
    project: ProjectState;
    view: ViewState;
    selection: SelectionState;
    pages: PagesState;
}

export const sessionReducer = combineReducers({
    user: userReducer,
    project: projectReducer,
    view: viewReducer,
    selection: selectionReducer,
    pages: pagesReducer
});
