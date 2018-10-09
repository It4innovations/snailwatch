import {combineEpics} from 'redux-observable';
import {throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ApiError} from '../../../lib/errors/api';
import {ofAction} from '../../../util/redux-observable';
import {createRequestEpic} from '../../../util/request';
import {AppEpic} from '../../app/app-epic';
import {initUserSession} from '../actions';
import {changePasswordAction, loginUserAction, UserActions} from './actions';
import {getToken} from './reducers';

const loadUserEpic = createRequestEpic(UserActions.loadOne, (action, store, deps) =>
    deps.client.loadUser(getToken(store.value), action.payload)
);
const updateUserEpic = createRequestEpic(UserActions.update, (action, store, deps) =>
    deps.client.updateUser(getToken(store.value), action.payload)
);

const loginUserEpic = createRequestEpic(loginUserAction, (action, store, deps) =>
    deps.client.loginUser(action.payload.username, action.payload.password).pipe(
        catchError(error => {
            if (error instanceof ApiError && error.status === 403)
            {
                return throwError('You have entered invalid credentials');
            }

            return throwError(error);
        }))
);
const changePasswordEpic = createRequestEpic(changePasswordAction, (action, store, deps) =>
    deps.client.changePassword(getToken(store.value), action.payload.oldPassword, action.payload.newPassword)
);

const initUserSessionAfterLogin: AppEpic = action$ =>
    action$.pipe(
        ofAction(loginUserAction.done),
        map(() => initUserSession())
    );

export const userEpics = combineEpics(
    loadUserEpic,
    updateUserEpic,
    loginUserEpic,
    changePasswordEpic,
    initUserSessionAfterLogin
);
