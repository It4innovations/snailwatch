import {SnailClient} from './snail-client';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import axios from 'axios';
import {User} from '../user/user';
import {Project} from '../project/project';
import {Benchmark} from '../benchmark/benchmark';

interface ArrayResponse<T>
{
    _items: T[];
}

interface ProjectDAO
{
    _id: string;
    name: string;
}
interface BenchmarkDAO
{
    _id: string;
    name: string;
}

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
        });
    }

    createProject(user: User, name: string): Observable<boolean>
    {
        return this.call('/projects', 'POST', {
            name
        }, {
            token: user.token
        }).map(() => true);
    }
    loadProjects(user: User): Observable<Project[]>
    {
        return this.call('/projects', 'GET', {}, {
            token: user.token
        })
        .map((data: ArrayResponse<ProjectDAO>) =>
            data._items
            .map((project: ProjectDAO) => ({
                id: project._id,
                name: project.name
            }))
        );
    }

    loadBenchmarks(user: User, project: Project): Observable<Benchmark[]>
    {
        return this.call('/benchmarks', 'GET', {
            where: `{"project":"${project.id}"}`
        }, {
            token: user.token
        })
            .map((data: ArrayResponse<BenchmarkDAO>) =>
                data._items
                    .map((benchmark: BenchmarkDAO) => ({
                        id: benchmark._id,
                        name: benchmark.name
                    }))
            );
    }

    private call<T>(path: string, method: 'GET' | 'POST',
                    params: {[key: string]: string}, options: {
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
            .then(result => {
                return result.data;
            }));
    }
}
