import {SnailClient} from './snail-client';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import axios from 'axios';
import {User} from '../user/user';
import {Project} from '../project/project';
import {Measurement} from '../measurement/measurement';
import * as moment from 'moment';

interface ArrayResponse<T>
{
    _items: T[];
}

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
    measurement: {};
    environment: {};
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

    loadMeasurements(user: User, project: Project): Observable<Measurement[]>
    {
        return this.call('/measurements', 'GET', {
            where: `{"project":"${project.id}"}`
        }, {
            token: user.token
        })
            .map((data: ArrayResponse<MeasurementDAO>) =>
                data._items
                    .map(m => this.parseMeasurement(m))
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
            environment: {...measurement.environment},
            measurement: {...measurement.measurement},
            createdAt: moment(measurement._created)
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
