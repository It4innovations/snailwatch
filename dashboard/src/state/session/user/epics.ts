import {combineEpics} from 'redux-observable';
import {changePassword, loginUser} from './actions';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import {getUser} from './reducer';
import {createRequestEpic} from '../../../util/request';

const loginUserEpic = createRequestEpic(loginUser, (action, state, deps) =>
    deps.client.loginUser(action.payload.username, action.payload.password)
);
const changePasswordEpic = createRequestEpic(changePassword, (action, state, deps) =>
    deps.client.changePassword(getUser(state), action.payload.oldPassword, action.payload.newPassword)
);

export const userEpics = combineEpics(
    loginUserEpic,
    changePasswordEpic
);
