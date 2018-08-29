import {combineEpics} from 'redux-observable';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {ApiError} from '../../../lib/errors/api';
import {createRequestEpic} from '../../../util/request';
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

export const userEpics = combineEpics(
    loginUserEpic,
    changePasswordEpic
);
