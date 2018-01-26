import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {loginUser, logoutUser} from './actions';
import {AppState} from '../app/reducers';
import {User} from '../../lib/user/user';
import {createSelector} from 'reselect';
import {RequestContext, requestDone, requestErrored, requestStarted} from '../../util/request';

export interface UserState
{
    user: User;
    loginRequest: RequestContext;
}

const reducer = reducerWithInitialState<UserState>({
    user: null,
    loginRequest: requestDone()
})
.case(loginUser.started, state => ({
    ...state,
    loginRequest: requestStarted()
}))
.case(loginUser.failed, (state, response) => ({
    ...state,
    loginRequest: requestErrored(response.error)
}))
.case(loginUser.done, (state, response) => ({
    ...state,
    loginRequest: requestDone(),
    user: response.result
}))
.case(logoutUser, (state) => ({
    ...state,
    user: null
}));

export const getUser = (state: AppState) => state.user.user;
export const isUserAuthenticated = createSelector(
    getUser,
    (user: User) => user !== null && user.token !== null
);

export const userReducer = reducer;
