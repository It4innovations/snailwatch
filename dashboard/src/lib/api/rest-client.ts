import {SnailClient} from './snail-client';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import axios, {AxiosError} from 'axios';
import {User} from '../user/user';
import {Project} from '../project/project';
import {Measurement} from '../measurement/measurement';
import {Filter} from '../measurement/selection/filter';
import {buildRequestFilter} from './filter';
import {
    DAO, MeasurementDAO, ProjectDAO, SelectionDAO,
    parseMeasurement, parseSelection, parseProject, serializeDate, UserDAO, parseAnalysis, AnalysisDAO
} from './dao';
import {Selection} from '../measurement/selection/selection';
import {RangeFilter} from '../measurement/selection/range-filter';
import {NetworkError} from '../errors/network';
import {ApiError} from '../errors/api';
import {Analysis} from '../analysis/analysis';

interface ArrayResponse<T>
{
    _items: T[];
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
        }).map((user: UserDAO) => ({
            id: user.id,
            token: user.token,
            username
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
                     selection: Selection,
                     range: RangeFilter): Observable<Measurement[]>
    {
        let filters: Filter[] = [];
        if (selection !== null)
        {
            filters = [...filters, ...selection.filters];
        }

        filters = [...filters, {
            path: 'project',
            operator: '==',
            value: project.id
        }];

        if (range.useDateFilter)
        {
            const from = range.from.startOf('date');
            const to = range.to.startOf('date');

            filters = [...filters, {
                path: 'timestamp',
                operator: '>=',
                value: serializeDate(from)
            }, {
                path: 'timestamp',
                operator: '<=',
                value: serializeDate(to)
            }];
        }

        let args: {} = {
            where: JSON.stringify(buildRequestFilter(filters)),
            sort: '-timestamp'
        };

        if (!range.useDateFilter)
        {
            args = {...args, max_results: range.entryCount };
        }

        return this.call('/measurements', 'GET', args, {
            token: user.token
        })
            .map((data: ArrayResponse<MeasurementDAO>) =>
                data._items.map(m => parseMeasurement(m))
        );
    }
    deleteMeasurement(user: User, measurement: Measurement): Observable<boolean>
    {
        return this.call(`/measurements/${measurement.id}`, 'DELETE', {}, {
            token: user.token
        }).map(() => true);
    }
    deleteAllMeasurements(user: User): Observable<boolean>
    {
        return this.call(`/clear-measurements`, 'POST', {}, {
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
            .map((data: ArrayResponse<SelectionDAO>) =>
                data._items
                    .map(v => parseSelection(v))
            );
    }
    createSelection(user: User, project: Project, selection: Selection): Observable<Selection>
    {
        return this.call('/selections', 'POST', {
            name: selection.name,
            project: project.id,
            filters: selection.filters.map(f => ({
                path: f.path,
                operator: f.operator,
                value: f.value
            }))
        }, {
            token: user.token
        })
        .map((data: DAO) => ({
            ...selection,
            id: data._id
        }));
    }
    deleteSelection(user: User, selection: Selection): Observable<boolean>
    {
        return this.call(`/selections/${selection.id}`, 'DELETE', {}, {
            token: user.token
        }).map(() => true);
    }
    updateSelection(user: User, selection: Selection): Observable<boolean>
    {
        return this.call(`/selections/${selection.id}`, 'PATCH', {
            name: selection.name,
            filters: selection.filters.map(f => ({
                path: f.path,
                operator: f.operator,
                value: f.value
            }))
        }, {
            token: user.token
        }).map(() => true);
    }

    loadAnalyses(user: User, project: Project): Observable<Analysis[]>
    {
        return this.call('/analyses', 'GET', {
            where: JSON.stringify({
                project: project.id
            })
        }, {
            token: user.token
        })
            .map((data: ArrayResponse<AnalysisDAO>) =>
                data._items
                    .map(v => parseAnalysis(v))
            );
    }
    createAnalysis(user: User, project: Project, analysis: Analysis): Observable<Analysis>
    {
        return this.call('/analyses', 'POST', {
            name: analysis.name,
            project: analysis.id,
            filters: analysis.filters.map(f => ({
                path: f.path,
                operator: f.operator,
                value: f.value
            })),
            trigger: analysis.trigger,
            observedvalue: analysis.observedValue,
            ratio: analysis.ratio
        }, {
            token: user.token
        })
            .map((data: DAO) => ({
                ...analysis,
                id: data._id
            }));
    }

    deleteAnalysis(user: User, analysis: Analysis): Observable<boolean>
    {
        return this.call(`/analyses/${analysis.id}`, 'DELETE', {}, {
            token: user.token
        }).map(() => true);
    }

    updateAnalysis(user: User, analysis: Analysis): Observable<boolean>
    {
        return this.call(`/analyses/${analysis.id}`, 'PATCH', {
            name: analysis.name,
            filters: analysis.filters.map(f => ({
                path: f.path,
                operator: f.operator,
                value: f.value
            })),
            trigger: analysis.trigger,
            observedvalue: analysis.observedValue,
            ratio: analysis.ratio
        }, {
            token: user.token
        }).map(() => true);
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
                .then(result => result.data)
                .catch(this.handleError)
            );
    }

    private handleError(error: AxiosError)
    {
        console.error(error);
        if (error.response === undefined) throw new NetworkError();

        throw new ApiError(error.response.status, error.message);
    }
}
