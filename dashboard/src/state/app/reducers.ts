import {RouterState} from 'react-router-redux';
import {SessionState, sessionReducer} from '../session/reducers';

export interface AppState
{
    session: SessionState;
    router: RouterState;
}

export const reducers = {
    session: sessionReducer
};
