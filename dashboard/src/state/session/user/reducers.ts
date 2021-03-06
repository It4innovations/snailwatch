import {compose} from 'ramda';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {User} from '../../../lib/user/user';
import {createRequest, hookRequestActions, Request} from '../../../util/request';
import {AppState} from '../../app/reducers';
import {clearSession} from '../actions';
import {changePasswordAction, loginUserAction, UserActions} from './actions';

export interface UserState
{
    user: User;
    token: string;
    userRequest: Request;
    changePasswordRequest: Request;
}

const initialState: UserState = {
    user: null,
    token: null,
    userRequest: createRequest(),
    changePasswordRequest: createRequest()
};

let reducers = reducerWithInitialState<UserState>({ ...initialState })
.case(clearSession, () => ({ ...initialState }));

reducers = compose(
    (r: typeof reducers) => hookRequestActions(r, loginUserAction,
        state => state.userRequest,
        (state, action) => ({
            user: action.payload.result.user,
            token: action.payload.result.token
        })
), (r: typeof reducers) => hookRequestActions(r, UserActions.loadOne,
    state => state.userRequest,
    (state, action) => ({
        user: action.payload.result
    })
), (r: typeof reducers) => hookRequestActions(r, UserActions.update,
    state => state.userRequest,
    (state, action) => ({
        user: action.payload.params
    })
), (r: typeof reducers) => hookRequestActions(r, changePasswordAction,
        state => state.changePasswordRequest
))(reducers);

export const getUser = (state: AppState) => state.session.user.user;
export const getToken = (state: AppState) => state.session.user.token;
export const isUserAuthenticated = (state: AppState) => getUser(state) !== null && getToken(state) !== null;

export const userReducer = reducers;
