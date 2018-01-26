import {SnailClient} from './snail-client';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import axios from 'axios';
import qs from 'qs';
import {User} from '../user/user';
import {Project} from '../project/project';

export class RestClient implements SnailClient
{
    constructor(private url: string)
    {

    }

    loginUser(username: string, password: string): Observable<string>
    {
        return this.call('/login', 'POST', {
            username,
            password
        }, {
            urlencoded: true
        });
    }
    loadProjects(user: User): Observable<Project[]>
    {
        return this.call('/projects', 'GET', {}, {
            token: user.token
        }).map(data => data['_items']);
    }

    private call<T>(path: string, method: 'GET' | 'POST',
                    params: {[key: string]: string}, options: {
            token?: string;
            urlencoded?: boolean;
        } = {
            token: null,
            urlencoded: false
        }): Observable<T>
    {
        let headers = {};
        if (options.token !== null)
        {
            headers['Authorization'] = options.token;
        }
        if (options.urlencoded)
        {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }

        let request = {
            baseURL: this.url,
            url: path,
            method,
            headers,
            responseType: options.urlencoded ? 'text' : 'json'
        };

        if (method === 'GET')
        {
            request['params'] = params;
        }
        else
        {
            request['data'] = options.urlencoded ? qs.stringify(params) : params;
        }

        return Observable
            .fromPromise(axios(request)
            .then(result => {
                return result.data;
            }));
    }
}
