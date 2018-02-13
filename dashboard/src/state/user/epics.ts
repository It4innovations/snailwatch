import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {loginUser, logoutUser} from './actions';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {Action} from 'typescript-fsa';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import {clearMeasurements} from '../measurement/actions';
import {clearProjects} from '../project/actions';
import {AppEpic} from '../app/app-epic';

interface LoginData
{
    username: string;
    password: string;
}

const loginUserEpic = (action$: ActionsObservable<ReduxAction>,
                       store: Store<AppState>,
                       deps: ServiceContainer) =>
    action$
        .ofAction(loginUser.started)
        .switchMap((action: Action<LoginData>) =>
            deps.client.loginUser(action.payload.username, action.payload.password)
                .map(result =>
                    loginUser.done({
                        params: action.payload,
                        result
                    })
                ).catch(error =>
                    Observable.of(loginUser.failed({
                        params: action.payload,
                        error
                    }))
                )
        );

const clearDataAfterLogout: AppEpic = (action$: ActionsObservable<ReduxAction>) =>
    action$
        .ofAction(logoutUser)
        .switchMap(() =>
            Observable.from([
                clearMeasurements(),
                clearProjects()
            ])
        );

export const userEpics = combineEpics(
    loginUserEpic,
    clearDataAfterLogout
);
