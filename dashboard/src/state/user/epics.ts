import {ActionsObservable, combineEpics} from 'redux-observable';
import {Action as ReduxAction} from 'redux';
import {loginUser, logoutUser} from './actions';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import {clearMeasurements} from '../measurement/actions';
import {clearProjects} from '../project/actions';
import {AppEpic} from '../app/app-epic';
import {createRequestEpic} from '../../util/request';
import {clearViews} from '../view/actions';

const loginUserEpic = createRequestEpic(loginUser, (action, state, deps) =>
    deps.client.loginUser(action.payload.username, action.payload.password)
);

const clearDataAfterLogout: AppEpic = (action$: ActionsObservable<ReduxAction>) =>
    action$
        .ofAction(logoutUser)
        .switchMap(() =>
            Observable.from([
                clearMeasurements(),
                clearProjects(),
                clearViews()
            ])
        );

export const userEpics = combineEpics(
    loginUserEpic,
    clearDataAfterLogout
);
