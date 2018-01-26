import {ActionsObservable, combineEpics} from 'redux-observable';
import {Store, Action as ReduxAction} from 'redux';
import {loginUser} from './actions';
import {ServiceContainer} from '../app/di';
import {AppState} from '../app/reducers';
import {Action} from 'typescript-fsa';
import {Observable} from 'rxjs/Observable';
import '../../util/redux-observable';
import 'rxjs/add/observable/of';
import {push} from 'react-router-redux';
import {Navigation, Routes} from '../nav/routes';

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
                .map((token: string) =>
                    loginUser.done({
                        params: action.payload,
                        result: {
                            username: action.payload.username,
                            token
                        }
                    })
                ).catch(error =>
                    Observable.of(loginUser.failed({
                        params: action.payload,
                        error
                    }))
                )
        );

export const userEpics = combineEpics(
    loginUserEpic
);
