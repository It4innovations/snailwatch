import {combineReducers} from 'redux';
import {pagesReducer, PagesState} from './pages/reducers';
import {projectReducer, ProjectState} from './project/reducer';
import {userReducer, UserState} from './user/reducer';
import {viewReducer, ViewState} from './view/reducer';

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
