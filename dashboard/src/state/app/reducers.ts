import {userReducer, UserState} from '../user/reducer';
import {RouterState} from 'react-router-redux';
import {projectReducer, ProjectState} from '../project/reducer';
import {measurementReducer, MeasurementState} from '../measurement/reducer';
import {SelectionState, selectionReducer} from '../selection/reducer';
import {uiReducer, UIState} from '../ui/reducer';

export interface AppState
{
    user: UserState;
    project: ProjectState;
    measurement: MeasurementState;
    selection: SelectionState;
    ui: UIState;
    router: RouterState;
}



export const reducers = {
    user: userReducer,
    project: projectReducer,
    selection: selectionReducer,
    measurement: measurementReducer,
    ui: uiReducer
};
