export interface RequestContext
{
    loading: boolean;
    error: string;
}

export function requestStarted(): RequestContext
{
    return {
        loading: true,
        error: null
    };
}
export function requestErrored(error: string): RequestContext
{
    return {
        loading: false,
        error
    };
}
export function requestDone(): RequestContext
{
    return {
        loading: false,
        error: null
    };
}
