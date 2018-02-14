import {ReducerBuilder} from 'typescript-fsa-reducers';
import {Action, AsyncActionCreators, Success} from 'typescript-fsa';
import {AppEpic} from '../state/app/app-epic';
import {AppState} from '../state/app/reducers';
import {ActionsObservable} from 'redux-observable';
import {Observable} from 'rxjs/Observable';
import {Action as ReduxAction, Store} from 'redux';
import {ServiceContainer} from '../state/app/di';

export interface Request
{
    loading: boolean;
    error: string;
}

export function createRequest(): Request
{
    return {
        loading: false,
        error: null
    };
}
export function requestStarted(): Request
{
    return {
        loading: true,
        error: null
    };
}
export function requestErrored(error: string): Request
{
    return {
        loading: false,
        error
    };
}
export function requestDone(): Request
{
    return {
        loading: false,
        error: null
    };
}

function replaceKey<T, Value>(obj: T, valueSelector: (obj: T) => Value, value: Value)
{
    let originalValue = valueSelector(obj);
    for (const key of Object.keys(obj))
    {
        if (obj[key] === originalValue)
        {
            obj[key] = value;
            break;
        }
    }
}
export function hookRequestActions<T extends {}, P, S, E>(reducer: ReducerBuilder<T, T>,
                                                          action: AsyncActionCreators<P, S, E>,
                                                          requestSelector: (state: T) => Request,
                                                          mapData: (state: T, result: Action<Success<P, S>>)
                                                              => Partial<T> = null)
: ReducerBuilder<T, T>
{
    return reducer
        .case(action.started, (state: T) => {
            let nextstate = {...(state as object)};
            replaceKey(nextstate, requestSelector, requestStarted());
            return nextstate as T;
        })
        .case(action.failed, (state: T, response) => {
            let nextstate = {...(state as object)};
            replaceKey(nextstate, requestSelector, requestErrored(response.error.toString()));
            return nextstate as T;
        })
        .caseWithAction(action.done, (state: T, response) => {
            let nextstate = {...(state as object)};
            replaceKey(nextstate, requestSelector, requestDone());

            if (mapData !== null)
            {
                let mapped = mapData(nextstate as T, response);
                nextstate = {...nextstate, ...(mapped as object)};
            }

            return nextstate as T;
        });
}

export function mapRequestToActions<P, S, E>(creator: AsyncActionCreators<P, S, E>,
                                             action: Action<P>,
                                             request: Observable<S>)
: Observable<ReduxAction>
{
    return request
        .map(result =>
            creator.done({
                params: action.payload,
                result
            })
        ).catch(error =>
            Observable.of(creator.failed({
                params: action.payload,
                error
            }))
        );
}

export function createRequestEpic<P, S, E>(creator: AsyncActionCreators<P, S, E>,
                                           startRequest: (action: Action<P>,
                                                          state: AppState,
                                                          deps: ServiceContainer) => Observable<S>): AppEpic
{
    return (action$: ActionsObservable<ReduxAction>,
            store: Store<AppState>,
            deps: ServiceContainer) =>
        action$
            .ofAction(creator.started)
            .switchMap((action: Action<P>) =>
                {
                    return mapRequestToActions(creator, action, startRequest(action, store.getState(), deps));
                }
            );
}
