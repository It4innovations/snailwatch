import {combineEpics} from 'redux-observable';
import {changePassword, loginUser} from './actions';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {getUser} from './reducer';
import {createRequestEpic} from '../../../util/request';
import {ApiError} from '../../../lib/errors/api';
import {Observable} from 'rxjs/Observable';

const loginUserEpic = createRequestEpic(loginUser, (action, state, deps) =>
    deps.client.loginUser(action.payload.username, action.payload.password)
        .catch(error => {
            if (error instanceof ApiError && error.status === 403)
            {
                return Observable.throw('You have entered invalid credentials');
            }

            return Observable.throw(error);
        })
);
const changePasswordEpic = createRequestEpic(changePassword, (action, state, deps) =>
    deps.client.changePassword(getUser(state), action.payload.oldPassword, action.payload.newPassword)
);

export const userEpics = combineEpics(
    loginUserEpic,
    changePasswordEpic
);
