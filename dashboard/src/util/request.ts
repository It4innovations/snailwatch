import {ReducerBuilder} from 'typescript-fsa-reducers';
import {AsyncActionCreators} from 'typescript-fsa';

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
                                                          mapData: (state: T, result: S) => Partial<T> = null)
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
        .case(action.done, (state: T, response) => {
            let nextstate = {...(state as object)};
            replaceKey(nextstate, requestSelector, requestDone());

            if (mapData !== null)
            {
                let mapped = mapData(nextstate as T, response.result);
                nextstate = {...nextstate, ...(mapped as object)};
            }

            return nextstate as T;
        });
}
