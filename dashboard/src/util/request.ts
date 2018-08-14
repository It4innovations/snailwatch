import {Action as ReduxAction} from 'redux';
import {ActionsObservable, StateObservable} from 'redux-observable';
import {from as observableFrom, Observable} from 'rxjs';
import {catchError, map, switchMap} from 'rxjs/operators';
import {Action, AsyncActionCreators, Success} from 'typescript-fsa';
import {ReducerBuilder} from 'typescript-fsa-reducers';
import {isObject} from 'util';
import {ApiError} from '../lib/errors/api';
import {AppEpic} from '../state/app/app-epic';
import {ServiceContainer} from '../state/app/di';
import {AppState} from '../state/app/reducers';
import {clearSession} from '../state/session/actions';
import {ofAction} from './redux-observable';

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
    return request.pipe(
        map(result =>
            creator.done({
                params: action.payload,
                result
            })
        ), catchError(error => {
            const failed = creator.failed({
                params: action.payload,
                error
            });
            const observables = [failed];

            if (error instanceof ApiError && error.status === 401)
            {
                observables.push(clearSession());
            }

            return observableFrom(observables);
        }));
}

export function createRequestEpic<P, S, E>(creator: AsyncActionCreators<P, S, E>,
                                           startRequest: (action: Action<P>,
                                                          state: AppState,
                                                          deps: ServiceContainer) => Observable<S>): AppEpic
{
    return (action$: ActionsObservable<ReduxAction>,
            store: StateObservable<AppState>,
            deps: ServiceContainer) =>
        action$.pipe(
            ofAction(creator.started),
            switchMap((action: Action<P>) =>
                mapRequestToActions(creator, action, startRequest(action, store.value, deps))
            )
        );
}
