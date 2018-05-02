import {ReducerBuilder} from 'typescript-fsa-reducers';
import {Action, AsyncActionCreators, Success} from 'typescript-fsa';
import {AppEpic} from '../state/app/app-epic';
import {AppState} from '../state/app/reducers';
import {ActionsObservable} from 'redux-observable';
import {Observable} from 'rxjs/Observable';
import {Action as ReduxAction, Store} from 'redux';
import {ServiceContainer} from '../state/app/di';
import '../util/redux-observable';
import {any} from 'ramda';
import {isObject} from 'util';

export interface Request
{
    loading: boolean;
    error: string;
    completed: boolean;
}

export function createRequest(): Request
{
    return {
        loading: false,
        error: null,
        completed: false
    };
}
export function requestStarted(): Request
{
    return {
        loading: true,
        error: null,
        completed: false
    };
}
export function requestErrored(error: string): Request
{
    return {
        loading: false,
        error,
        completed: true
    };
}
export function requestDone(): Request
{
    return {
        loading: false,
        error: null,
        completed: true
    };
}

export function isRequest(request: {}): boolean
{
    return isObject(request) &&
        request.hasOwnProperty('loading') &&
        request.hasOwnProperty('error') &&
        request.hasOwnProperty('completed');
}

export function combineRequests(...requests: Request[]): Request
{
    return {
        loading: any(r => r.loading, requests),
        error: requests.map(r => r.error).find(r => r !== null) || null,
        completed: any(r => r.completed, requests)
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
                                                          action: AsyncActionCreators<P, S, E> |
                                                              AsyncActionCreators<P, S, E>[],
                                                          requestSelector: (state: T) => Request,
                                                          mapData: (state: T, result: Action<Success<P, S>>)
                                                              => Partial<T> = null)
: ReducerBuilder<T, T>
{
    if (!Array.isArray(action))
    {
        action = [action];
    }

    return reducer
        .cases(action.map(a => a.started), (state: T) => {
            let nextstate = {...(state as object)};
            replaceKey(nextstate, requestSelector, requestStarted());
            return nextstate as T;
        })
        .cases(action.map(a => a.failed), (state: T, response) => {
            let nextstate = {...(state as object)};
            replaceKey(nextstate, requestSelector, requestErrored(response.error.toString()));
            return nextstate as T;
        })
        .casesWithAction(action.map(a => a.done), (state: T, response) => {
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
