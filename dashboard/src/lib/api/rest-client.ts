import {FetchResult, SnailClient} from './snail-client';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import axios from 'axios';
import {User} from '../user/user';
import {Project} from '../project/project';
import {Measurement} from '../measurement/measurement';
import moment from 'moment';
import {Filter} from '../view/filter';
import {buildRequestFilter} from './filter';

interface ArrayResponse<T>
{
    _items: T[];
}

type PaginatedResponse<T> = T & {
    _meta: {
        total: number;
        max_results: number;
        page: number;
    }
};

interface DAO
{
    _id: string;
    _created: string;
}

interface ProjectDAO extends DAO
{
    name: string;
}
interface MeasurementDAO extends DAO
{
    benchmark: string;
    timestamp: string;
    environment: {};
    result: {};
}

export class RestClient implements SnailClient
{
    constructor(private url: string)
    {

    }

    loginUser(username: string, password: string): Observable<User>
    {
        return this.call('/login', 'POST', {
            username,
            password
        }).map((token: string) => ({
            username,
            token
        }));
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
            .map(p => this.parseProject(p))
        );
    }
    loadProject(user: User, name: string): Observable<Project>
    {
        return this.call('/projects', 'GET', {
            where: `{"name":"${name}"}`
        }, {
            token: user.token
        })
            .map((data: ArrayResponse<ProjectDAO>) =>
                data._items
                    .map(p => this.parseProject(p))
            )
            .map(projects => {
                if (projects.length === 0)
                {
                    throw new Error(`Project ${name} not found`);
                }
                return projects[0];
            });
    }

    loadMeasurements(user: User, project: Project,
                     filters: Filter[],
                     sortBy: string,
                     page: number,
                     count: number): Observable<FetchResult<Measurement>>
    {
        const filter = buildRequestFilter([...filters, {
            id: 0,
            path: 'project',
            operator: '==',
            value: project.id
        }]);

        return this.call('/measurements', 'GET', {
            where: filter,
            page: page.toString(),
            max_results: count.toString(),
            sort: sortBy
        }, {
            token: user.token
        })
            .map((data: PaginatedResponse<ArrayResponse<MeasurementDAO>>) => ({
                items: data._items
                    .map(m => this.parseMeasurement(m)),
                total: data._meta.total
            })
        );
    }

    private parseProject(project: ProjectDAO): Project
    {
        return {
            id: project._id,
            name: project.name,
            createdAt: moment(project._created)
        };
    }
    private parseMeasurement(measurement: MeasurementDAO): Measurement
    {
        return {
            id: measurement._id,
            benchmark: measurement.benchmark,
            timestamp: moment(measurement.timestamp),
            environment: {...measurement.environment},
            result: {...measurement.result}
        };
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
