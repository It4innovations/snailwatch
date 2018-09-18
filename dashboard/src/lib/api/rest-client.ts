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
    MeasurementDAO,
    parseMeasurement,
    parseProject,
    parseView,
    ProjectDAO,
    serializeDate,
    serializeProject,
    serializeView,
    sort,
    UserDAO,
    ViewDAO,
    where,
    withProject
} from './dao';
import {buildRequestFilter} from './filter';
import {RequestManager} from './request-manager';
import {SnailClient} from './snail-client';

export class RestClient implements SnailClient
{
    private readonly requestManager: RequestManager;
    private readonly projectCrud: CrudHandler<Project, ProjectDAO>;
    private readonly measurementCrud: CrudHandler<Measurement, MeasurementDAO>;
    private readonly viewCrud: CrudHandler<View, ViewDAO>;

    constructor(url: string)
    {
        this.requestManager = new RequestManager(url);
        this.projectCrud = new CrudHandler(this.requestManager, '/projects', parseProject);
        this.measurementCrud = new CrudHandler(this.requestManager, '/measurements', parseMeasurement);
        this.viewCrud = new CrudHandler(this.requestManager, '/views', parseView);
    }

    loginUser(username: string, password: string): Observable<User>
    {
        return this.requestManager.request('/login', 'POST', {
            username,
            password
        }).pipe(map((user: UserDAO) => ({
            id: user.id,
            token: user.token,
            username
        })));
    }
    changePassword(user: User, oldPassword: string, newPassword: string): Observable<boolean>
    {
        return this.requestManager.request('/change-password', 'POST', {
            oldPassword,
            newPassword
        }, {
            token: user.token
        }).pipe(map(() => true));
    }

    createProject(user: User, project: Project): Observable<Project>
    {
        return this.projectCrud.create(user, serializeProject(project));
    }
    loadProjects(user: User): Observable<Project[]>
    {
        return this.projectCrud.load(user);
    }
    loadProject(user: User, name: string): Observable<Project>
    {
        return this.projectCrud.load(user, where({ name })).pipe(map(projects => {
            if (projects.length === 0)
            {
                throw new Error(`Project ${name} not found`);
            }
            return projects[0];
        }));
    }
    updateProject(user: User, project: Project): Observable<boolean>
    {
        return this.projectCrud.update(user, project, serializeProject(project));
    }

    regenerateUploadToken(user: User, project: Project): Observable<string>
    {
        return this.requestManager.request(`${this.projectPath(project)}/upload-token`, 'POST', {
            project: project.id
        }, {
            token: user.token
        }).pipe(map((token: string) => token));
    }

    loadMeasurements(user: User, project: Project,
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

        let args: {} = where(buildRequestFilter(filters), sort('-timestamp'));

        if (!range.useDateFilter)
        {
            args = {...args, max_results: range.entryCount };
        }

        return this.measurementCrud.load(user, args);
    }
    deleteMeasurement(user: User, measurement: Measurement): Observable<boolean>
    {
        return this.measurementCrud.delete(user, measurement);
    }
    deleteProjectMeasurements(user: User, project: Project): Observable<boolean>
    {
        return this.requestManager.request(`${this.projectPath(project)}/measurements`, 'DELETE', {}, {
            token: user.token
        }).pipe(map(() => true));
    }

    loadViews(user: User, project: Project): Observable<View[]>
    {
        return this.viewCrud.load(user, where(withProject(project), sort('_created')));
    }
    createView(user: User, project: Project, view: View): Observable<View>
    {
        return this.viewCrud.create(user, withProject(project, serializeView(view)));
    }
    deleteView(user: User, view: View): Observable<boolean>
    {
        return this.viewCrud.delete(user, view);
    }
    updateView(user: User, view: View): Observable<boolean>
    {
        return this.viewCrud.update(user, view, serializeView(view));
    }

    private projectPath(project: Project): string
    {
        return `/projects/${project.id}`;
    }
}
