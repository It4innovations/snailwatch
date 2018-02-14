import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {loginUser, logoutUser} from './actions';
import {AppState} from '../app/reducers';
import {User} from '../../lib/user/user';
import {createSelector} from 'reselect';
import {createRequest, hookRequestActions, Request} from '../../util/request';
import {compose} from 'ramda';

export interface UserState
{
    user: User;
    loginRequest: Request;
}

let reducer = reducerWithInitialState<UserState>({
    user: null,
    loginRequest: createRequest()
})
.case(logoutUser, (state) => ({
    ...state,
    user: null
}));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loginUser,
        (state: UserState) => state.loginRequest,
        (state: UserState, action) => ({
            user: action.payload.result
        })
))(reducer);

export const getUser = (state: AppState) => state.user.user;
export const isUserAuthenticated = createSelector(
    getUser,
    (user: User) => user !== null && user.token !== null
);

export const userReducer = reducer;
