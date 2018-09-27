import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Measurement} from '../measurement/measurement';
import {Project} from '../project/project';
import {User} from '../user/user';
import {Filter} from '../view/filter';
import {RangeFilter} from '../view/range-filter';
import {View} from '../view/view';
import {CrudHandler} from './crud-handler';
import {
    MeasurementDAO, parseBatchedMeasurements,
    parseLoginResponse,
    parseMeasurement,
    parseProject,
    parseUser,
    parseView,
    ProjectDAO,
    serializeDate,
    serializeProject, serializeRangeFilter,
    serializeUser,
    serializeView,
    sort,
    UserDAO,
    ViewDAO,
    where,
    withProject
} from './dao';
import {buildRequestFilter} from './filter';
import {RequestManager} from './request-manager';
import {BatchedMeasurements, SnailClient} from './snail-client';

export class RestClient implements SnailClient
{
    private readonly requestManager: RequestManager;
    private readonly userCrud: CrudHandler<User, UserDAO>;
    private readonly projectCrud: CrudHandler<Project, ProjectDAO>;
    private readonly measurementCrud: CrudHandler<Measurement, MeasurementDAO>;
    private readonly viewCrud: CrudHandler<View, ViewDAO>;

    constructor(url: string)
    {
        this.requestManager = new RequestManager(url);
        this.userCrud = new CrudHandler(this.requestManager, '/users', parseUser);
        this.projectCrud = new CrudHandler(this.requestManager, '/projects', parseProject);
        this.measurementCrud = new CrudHandler(this.requestManager, '/measurements', parseMeasurement);
        this.viewCrud = new CrudHandler(this.requestManager, '/views', parseView);
    }

    loadUser(token: string, id: string): Observable<User>
    {
        return this.userCrud.loadOne(token, id);
    }
    updateUser(token: string, user: User): Observable<boolean>
    {
        return this.userCrud.update(token, user, serializeUser(user));
    }
    loginUser(username: string, password: string): Observable<{ user: User, token: string }>
    {
        return this.requestManager.request('/login', 'POST', {
            username,
            password
        }).pipe(map(parseLoginResponse));
    }
    changePassword(token: string, oldPassword: string, newPassword: string): Observable<boolean>
    {
        return this.requestManager.request('/change-password', 'POST', {
            oldPassword,
            newPassword
        }, {
            token
        }).pipe(map(() => true));
    }

    createProject(token: string, project: Project): Observable<Project>
    {
        return this.projectCrud.create(token, serializeProject(project));
    }
    loadProjects(token: string): Observable<Project[]>
    {
        return this.projectCrud.load(token);
    }
    loadProject(token: string, name: string): Observable<Project>
    {
        return this.projectCrud.load(token, where({ name })).pipe(map(projects => {
            if (projects.length === 0)
            {
                throw new Error(`Project ${name} not found`);
            }
            return projects[0];
        }));
    }
    updateProject(token: string, project: Project): Observable<boolean>
    {
        return this.projectCrud.update(token, project, serializeProject(project));
    }

    regenerateUploadToken(token: string, project: Project): Observable<string>
    {
        return this.requestManager.request(`${this.projectPath(project)}/upload-token`, 'POST', {
            project: project.id
        }, {
            token
        });
    }

    loadMeasurements(token: string,
                     project: Project,
                     view: View,
                     range: RangeFilter): Observable<Measurement[]>
    {
        let filters: Filter[] = [];
        if (view !== null)
        {
            filters = [...filters, ...view.filters];
        }

        filters = [...filters, {
            path: 'project',
            operator: '==',
            value: project.id
        }];

        if (range.useDateFilter)
        {
            const from = range.from.startOf('date');
            const to = range.to.endOf('date');

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

        let args: {} = where(buildRequestFilter(filters), sort('-timestamp'));

        if (!range.useDateFilter)
        {
            args = {...args, max_results: range.entryCount };
        }

        return this.measurementCrud.load(token, args);
    }
    loadMeasurementsBatched(token: string,
                            project: Project,
                            views: View[],
                            range: RangeFilter): Observable<BatchedMeasurements>
    {
        return this.requestManager.request(`${this.projectPath(project)}/batched-measurements`, 'POST', {
            views: views.map(v => v.id),
            range: serializeRangeFilter(range)
        }, {
            token
        }).pipe(map(parseBatchedMeasurements));
    }
    deleteMeasurement(token: string, measurement: Measurement): Observable<boolean>
    {
        return this.measurementCrud.delete(token, measurement);
    }
    deleteProjectMeasurements(token: string, project: Project): Observable<boolean>
    {
        return this.requestManager.request(`${this.projectPath(project)}/measurements`, 'DELETE', {}, {
            token
        }).pipe(map(() => true));
    }

    loadViews(token: string, project: Project): Observable<View[]>
    {
        return this.viewCrud.load(token, where(withProject(project), sort('_created')));
    }
    createView(token: string, project: Project, view: View): Observable<View>
    {
        return this.viewCrud.create(token, withProject(project, serializeView(view)));
    }
    deleteView(token: string, view: View): Observable<boolean>
    {
        return this.viewCrud.delete(token, view);
    }
    updateView(token: string, view: View): Observable<boolean>
    {
        return this.viewCrud.update(token, view, serializeView(view));
    }

    private projectPath(project: Project): string
    {
        return `/projects/${project.id}`;
    }
}
