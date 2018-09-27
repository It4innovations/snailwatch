import {combineReducers} from 'redux';
import {pagesReducer, PagesState} from './pages/reducers';
import {projectReducer, ProjectState} from './project/reducers';
import {userReducer, UserState} from './user/reducers';
import {viewReducer, ViewState} from './view/reducers';

export interface SessionState
{
    user: UserState;
    project: ProjectState;
    view: ViewState;
    pages: PagesState;
}

export const sessionReducer = combineReducers({
    user: userReducer,
    project: projectReducer,
    view: viewReducer,
    pages: pagesReducer
});
