import {userReducer, UserState} from './user/reducer';
import {combineReducers} from 'redux';
import {projectReducer, ProjectState} from './project/reducer';
import {selectionReducer, SelectionState} from './selection/reducer';
import {viewsReducer, ViewsState} from './views/reducers';

export interface SessionState
{
    user: UserState;
    project: ProjectState;
    selection: SelectionState;
    views: ViewsState;
}

export const sessionReducer = combineReducers({
    user: userReducer,
    project: projectReducer,
    selection: selectionReducer,
    views: viewsReducer
});
