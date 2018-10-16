import {default as moment, Moment} from 'moment';
import {Action as ReduxAction} from 'redux';
import {ActionsObservable, StateObservable} from 'redux-observable';
import {EMPTY, forkJoin, from as observableFrom, Observable, Observer} from 'rxjs';
import {catchError, finalize, flatMap, map, switchMap} from 'rxjs/operators';
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
    finishedAt: Moment;
}

export function createRequest(request: Partial<Request> = {}): Request
{
    return {
        loading: false,
        error: null,
        completed: false,
        finishedAt: null,
        ...request
    };
}
export function requestStarted(): Request
{
    return {
        loading: true,
        error: null,
        completed: false,
        finishedAt: null
    };
}
export function requestErrored(error: string): Request
{
    return {
        loading: false,
        error,
        completed: true,
        finishedAt: moment()
    };
}
export function requestDone(): Request
{
    return {
        loading: false,
        error: null,
        completed: true,
        finishedAt: moment()
    };
}

export function isRequest(request: {}): boolean
{
    return isObject(request) &&
        request.hasOwnProperty('loading') &&
        request.hasOwnProperty('error') &&
        request.hasOwnProperty('completed') &&
        request.hasOwnProperty('finishedAt');
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

export function handleActionError<P, S, E>(creator: AsyncActionCreators<P, S, E>,
                                           action: Action<P>,
                                           error: {} | Error)
    : Observable<ReduxAction>
{
    const failed = creator.failed({
        params: action.payload,
        error: error as E
    });
    const observables = [failed];

    if (error instanceof ApiError && error.status === 401)
    {
        observables.push(clearSession());
    }

    return observableFrom(observables);
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
        ), catchError(error => handleActionError(creator, action, error)));
}

const requestSet = new Set();
export function createRequestEpic<P, S, E>(creator: AsyncActionCreators<P, S, E>,
                                           startRequest: (action: Action<P>,
                                                          store: StateObservable<AppState>,
                                                          deps: ServiceContainer) => Observable<S>,
                                           refreshRequests = false): AppEpic
{
    return createRequestWrapper(creator, (action, store, deps) =>
        mapRequestToActions(creator, action, startRequest(action, store, deps)),
        refreshRequests
    );
}

export function createRequestEpicOptimistic<P, S, E>(creator: AsyncActionCreators<P, S, E>,
                                                     startRequest: (action: Action<P>,
                                                                    store: StateObservable<AppState>,
                                                                    deps: ServiceContainer) => Observable<S>,
                                                     optimisticValue: (action: Action<P>, state: AppState) => S,
                                                     revert: (action: Action<P>, state: AppState) =>
                                                         Observable<ReduxAction>,
                                                     refreshRequests = false
                                                     ): AppEpic
{
    return createRequestWrapper(creator, (action, store, deps) => {
        const state = store.value;
        const reverted = revert(action, state);
        return Observable.create((observer: Observer<ReduxAction>) => {
            // optimistically complete request
            observer.next(creator.done({
                params: action.payload,
                result: optimisticValue(action, state)
            }));

            // start real request
            const request = startRequest(action, store, deps);
            request.pipe(
                map(result =>
                    [creator.done({
                        params: action.payload,
                        result
                    })]
                ),
                catchError(error =>
                    forkJoin([
                        reverted,
                        handleActionError(creator, action, error)
                    ])
                )
            ).subscribe(actions => {
                for (const a of actions)
                {
                    observer.next(a);
                }
                observer.complete();
            });
        });
    }, refreshRequests);
}

/**
 * Runs the request, checking to make sure that more requests do not run in parallel.
 * @param creator
 * @param requestBody function that creates the request observable.
 * @param refreshRequests True if new requests of the same type should overwrite old ones,
 * false if they should be ignored.
 */
function createRequestWrapper<P, S, E>(creator: AsyncActionCreators<P, S, E>,
                                       requestBody: (action: Action<P>, store: StateObservable<AppState>,
                                                     deps: ServiceContainer) => Observable<ReduxAction>,
                                       refreshRequests: boolean
): AppEpic
{
    const operator = refreshRequests ? switchMap : flatMap;

    return (action$: ActionsObservable<ReduxAction>,
            store: StateObservable<AppState>,
            deps: ServiceContainer) =>
        action$.pipe(
            ofAction(creator.started),
            operator((action: Action<P>) =>
            {
                const type = action.type;

                if (requestSet.has(type) && !refreshRequests) return EMPTY;
                else requestSet.add(type);

                return requestBody(action, store, deps).pipe(
                    finalize(() => {
                        requestSet.delete(type);
                    })
                );
            })
        );
}
