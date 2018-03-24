import {FetchResult, SnailClient} from './snail-client';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import axios from 'axios';
import {User} from '../user/user';
import {Project} from '../project/project';
import {Measurement} from '../measurement/measurement';
import {Filter} from '../view/filter';
import {buildRequestFilter} from './filter';
import {DAO, MeasurementDAO, ProjectDAO, ViewDAO,
    parseMeasurement, parseView, parseProject} from './dao';
import {Selection} from '../view/view';

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
            .map(p => parseProject(p))
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
                    .map(p => parseProject(p))
            )
            .map(projects => {
                if (projects.length === 0)
                {
                    throw new Error(`Project ${name} not found`);
                }
                return projects[0];
            });
    }

    loadUploadToken(user: User, project: Project): Observable<string>
    {
        return this.call(`/get-upload-token/${project.id}`, 'GET', {}, {
            token: user.token
        }).map((token: string) => token);
    }
    regenerateUploadToken(user: User, project: Project): Observable<string>
    {
        return this.call('/revoke-upload-token', 'POST', {
            project: project.id
        }, {
            token: user.token
        }).map((token: string) => token);
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
                    .map(m => parseMeasurement(m)),
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

    loadSelections(user: User, project: Project): Observable<Selection[]>
    {
        return this.call('/selections', 'GET', {
            where: JSON.stringify({
                project: project.id
            })
        }, {
            token: user.token
        })
            .map((data: ArrayResponse<ViewDAO>) =>
                data._items
                    .map(v => parseView(v))
            );
    }
    createSelection(user: User, project: Project, view: Selection): Observable<Selection>
    {
        return this.call('/selections', 'POST', {
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
    deleteSelection(user: User, view: Selection): Observable<boolean>
    {
        return this.call(`/views/${view.id}`, 'DELETE', {}, {
            token: user.token
        }).map(() => true);
    }
    updateSelection(user: User, view: Selection): Observable<boolean>
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
