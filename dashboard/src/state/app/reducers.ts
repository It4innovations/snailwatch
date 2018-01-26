import {userReducer, UserState} from '../user/reducer';
import {RouterState} from 'react-router-redux';
import {projectReducer, ProjectState} from '../project/reducer';
import {benchmarkReducer, BenchmarkState} from '../benchmark/reducer';

export interface AppState
{
    user: UserState;
    project: ProjectState;
    benchmark: BenchmarkState;
    router: RouterState;
}

export const reducers = {
    user: userReducer,
    project: projectReducer,
    benchmark: benchmarkReducer
};
