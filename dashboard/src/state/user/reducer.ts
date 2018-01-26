import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {loginUser, logoutUser} from './actions';
import {AppState} from '../app/reducers';
import {User} from '../../lib/user/user';
import {createSelector} from 'reselect';

export interface UserState
{
    user: User;
    loginInProgress: boolean;
    loginError: string;
}

const reducer = reducerWithInitialState<UserState>({
    user: null,
    loginInProgress: false,
    loginError: null
})
.case(loginUser.started, state => ({
    ...state,
    loginInProgress: true,
    loginError: null
}))
.case(loginUser.failed, (state, error) => ({
    ...state,
    loginInProgress: false,
    loginError: error.error
}))
.case(loginUser.done, (state, user) => ({
    ...state,
    loginInProgress: false,
    loginError: null,
    user: user.result
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
