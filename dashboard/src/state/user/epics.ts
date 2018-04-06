import {ActionsObservable, combineEpics} from 'redux-observable';
import {Action as ReduxAction} from 'redux';
import {changePassword, loginUser, logoutUser} from './actions';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import {clearMeasurements} from '../measurement/actions';
import {clearProjects} from '../project/actions';
import {AppEpic} from '../app/app-epic';
import {createRequestEpic} from '../../util/request';
import {clearSelections} from '../selection/actions';

const loginUserEpic = createRequestEpic(loginUser, (action, state, deps) =>
    deps.client.loginUser(action.payload.username, action.payload.password)
);
const changePasswordEpic = createRequestEpic(changePassword, (action, state, deps) =>
    deps.client.changePassword(action.payload.user, action.payload.oldPassword, action.payload.newPassword)
);

const clearDataAfterLogout: AppEpic = (action$: ActionsObservable<ReduxAction>) =>
    action$
        .ofAction(logoutUser)
        .switchMap(() =>
            Observable.from([
                clearMeasurements(),
                clearProjects(),
                clearSelections()
            ])
        );

export const userEpics = combineEpics(
    loginUserEpic,
    changePasswordEpic,
    clearDataAfterLogout
);
