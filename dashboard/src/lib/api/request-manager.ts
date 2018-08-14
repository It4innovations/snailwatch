import {Observable} from 'rxjs/Observable';
import axios, {AxiosError} from 'axios';
import {NetworkError} from '../errors/network';
import {ApiError} from '../errors/api';
import 'rxjs/add/observable/fromPromise';

export class RequestManager
{
    constructor(private url: string)
    {

    }

    request<T>(path: string, method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
               params: {[key: string]: {}}, options: {
            token?: string;
        } = {
            token: null
        }): Observable<T>
    {
        let headers = {};
        if (options.token !== null)
        {
            headers['Authorization'] = options.token;
        }

        let request = {
            baseURL: this.url,
            url: path,
            method,
            headers,
            responseType: 'json'
        };

        if (method === 'GET')
        {
            request['params'] = params;
        }
        else
        {
            request['data'] = params;
        }

        return Observable
            .fromPromise(axios(request)
                .then(result => result.data)
                .catch(this.handleError)
            );
    }

    private handleError(error: AxiosError)
    {
        if (error.response === undefined) throw new NetworkError();
        console.error(error, error.response.statusText, error.response.data);

        throw new ApiError(error.response.status, error.message);
    }
}
