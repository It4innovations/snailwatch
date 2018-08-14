import axios, {AxiosError} from 'axios';
import 'rxjs/add/observable/fromPromise';
import {Observable} from 'rxjs/Observable';
import {ApiError} from '../errors/api';
import {NetworkError} from '../errors/network';

type HttpMethod = 'GET' | 'POST' | 'DELETE' | 'PATCH';

interface Request
{
    path: string;
    method: HttpMethod;
    params: {[key: string]: {}};
    options: {
        token?: string;
    };
}

export class RequestManager
{
    private promise: Promise<{}> = Promise.resolve({});

    constructor(private url: string)
    {

    }

    request<T>(path: string, method: HttpMethod, params: {[key: string]: {}}, options: {
            token?: string;
        } = {
            token: null
        }): Observable<T>
    {
        let request = {
            path,
            method,
            params,
            options
        };

        this.promise = this.promise.then(() => this.executeRequest(request));
        return Observable.fromPromise(this.promise) as Observable<T>;
    }

    private executeRequest<T>(request: Request): Promise<T>
    {
        let headers = {};
        if (request.options.token !== null)
        {
            headers['Authorization'] = request.options.token;
        }

        let data = {
            baseURL: this.url,
            url: request.path,
            method: request.method,
            headers,
            responseType: 'json'
        };

        if (request.method === 'GET')
        {
            data['params'] = request.params;
        }
        else
        {
            data['data'] = request.params;
        }

        return axios(data)
            .then(result => result.data)
            .catch(this.handleError);
    }

    private handleError(error: AxiosError)
    {
        if (error.response === undefined) throw new NetworkError();
        console.error(error, error.response.statusText, error.response.data);

        throw new ApiError(error.response.status, error.message);
    }
}
