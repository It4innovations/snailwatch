import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {changePassword, loginUser} from './actions';
import {AppState} from '../../app/reducers';
import {User} from '../../../lib/user/user';
import {createSelector} from 'reselect';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {compose} from 'ramda';
import {clearSession} from '../actions';

export interface UserState
{
    user: User;
    loginRequest: Request;
    changePasswordRequest: Request;
}

const initialState: UserState = {
    user: null,
    loginRequest: createRequest(),
    changePasswordRequest: createRequest()
};

let reducer = reducerWithInitialState<UserState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }));

reducer = compose(
    (r: typeof reducer) => hookRequestActions(r, loginUser,
        state => state.loginRequest,
        (state, action) => ({
            user: action.payload.result
        })
), (r: typeof reducer) => hookRequestActions(r, changePassword,
        state => state.changePasswordRequest
))(reducer);

export const getUser = (state: AppState) => state.session.user.user;
export const isUserAuthenticated = createSelector(
    getUser,
    (user: User) => user !== null && user.token !== null
);

export const userReducer = reducer;
