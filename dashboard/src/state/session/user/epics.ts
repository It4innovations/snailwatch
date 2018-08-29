import {combineEpics} from 'redux-observable';
import {throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ApiError} from '../../../lib/errors/api';
import {ofAction} from '../../../util/redux-observable';
import {createRequestEpic} from '../../../util/request';
import {AppEpic} from '../../app/app-epic';
import {initUserSession} from '../actions';
import {changePassword, loginUser} from './actions';
import {getUser} from './reducer';

const loginUserEpic = createRequestEpic(loginUser, (action, state, deps) =>
    deps.client.loginUser(action.payload.username, action.payload.password).pipe(
        catchError(error => {
            if (error instanceof ApiError && error.status === 403)
            {
                return throwError('You have entered invalid credentials');
            }

            return throwError(error);
        }))
);
const changePasswordEpic = createRequestEpic(changePassword, (action, state, deps) =>
    deps.client.changePassword(getUser(state), action.payload.oldPassword, action.payload.newPassword)
);

const initUserSessionAfterLogin: AppEpic = action$ =>
    action$.pipe(
        ofAction(loginUser.done),
        map(() => initUserSession())
    );

export const userEpics = combineEpics(
    loginUserEpic,
    changePasswordEpic,
    initUserSessionAfterLogin
);
