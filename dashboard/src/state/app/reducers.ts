import {userReducer, UserState} from '../user/reducer';
import {RouterState} from 'react-router-redux';
import {projectReducer, ProjectState} from '../project/reducer';
import {measurementReducer, MeasurementState} from '../measurement/reducer';

export interface AppState
{
    user: UserState;
    project: ProjectState;
    measurement: MeasurementState;
    router: RouterState;
}

export const reducers = {
    user: userReducer,
    project: projectReducer,
    measurement: measurementReducer
};
