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
import {DAO, MeasurementDAO, ProjectDAO, UploadTokenDAO, ViewDAO} from './dao';
import {View} from '../view/view';

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
    changePassword(user: User, oldPassword: string, newPassword: string): Observable<boolean>
    {
        return this.call('/change-password', 'POST', {
            oldPassword,
            newPassword
        }, {
            token: user.token
        }).map(() => true);
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
            where: JSON.stringify({
                name
            })
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

    generateUploadToken(user: User, project: Project): Observable<string>
    {
        return this.call('/uploadsessions', 'POST', {
            project: project.id
        }, {
            token: user.token
        }).map((data: UploadTokenDAO) => data.token);
    }

    loadMeasurements(user: User, project: Project,
                     filters: Filter[],
                     sortBy: string,
                     page: number,
                     count: number): Observable<FetchResult<Measurement>>
    {
        const filter = buildRequestFilter([...filters, {
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
    deleteMeasurement(user: User, measurement: Measurement): Observable<boolean>
    {
        return this.call(`/measurements/${measurement.id}`, 'DELETE', {}, {
            token: user.token
        }).map(() => true);
    }

    loadViews(user: User, project: Project): Observable<View[]>
    {
        return this.call('/views', 'GET', {
            where: JSON.stringify({
                project: project.id
            })
        }, {
            token: user.token
        })
            .map((data: ArrayResponse<ViewDAO>) =>
                data._items
                    .map(v => this.parseView(v))
            );
    }
    createView(user: User, project: Project, view: View): Observable<View>
    {
        return this.call('/views', 'POST', {
            name: view.name,
            project: project.id,
            filters: view.filters.map(f => ({
                path: f.path,
                operator: f.operator,
                value: f.value
            })),
            xAxis: view.projection.xAxis,
            yAxis: view.projection.yAxis
        }, {
            token: user.token
        })
        .map((data: DAO) => ({
            ...view,
            id: data._id
        }));
    }
    deleteView(user: User, view: View): Observable<boolean>
    {
        return this.call(`/views/${view.id}`, 'DELETE', {}, {
            token: user.token
        }).map(() => true);
    }
    updateView(user: User, view: View): Observable<boolean>
    {
        return this.call(`/views/${view.id}`, 'PATCH', {
            name: view.name,
            filters: view.filters.map(f => ({
                path: f.path,
                operator: f.operator,
                value: f.value
            })),
            xAxis: view.projection.xAxis,
            yAxis: view.projection.yAxis
        }, {
            token: user.token
        })
        .map(() => true);
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
    private parseView(view: ViewDAO): View
    {
        return {
            id: view._id,
            name: view.name,
            projection: {
                xAxis: view.xAxis,
                yAxis: view.yAxis
            },
            filters: view.filters.map(f => ({
                path: f.path,
                operator: f.operator,
                value: f.value
            }))
        };
    }

    private call<T>(path: string, method: 'GET' | 'POST' | 'DELETE' | 'PATCH',
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
            .then(result => {
                return result.data;
            }));
    }
}
