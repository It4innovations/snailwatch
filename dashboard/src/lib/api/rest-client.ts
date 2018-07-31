import {SnailClient} from './snail-client';
import {Observable} from 'rxjs/Observable';

import {User} from '../user/user';
import {Project} from '../project/project';
import {Measurement} from '../measurement/measurement';
import {Filter} from '../measurement/selection/filter';
import {buildRequestFilter} from './filter';
import {
    MeasurementDAO,
    ProjectDAO,
    SelectionDAO,
    parseMeasurement,
    parseSelection,
    parseProject,
    serializeDate,
    UserDAO,
    serializeSelection, ViewDAO, parseView, withProject, where, serializeView
} from './dao';
import {Selection} from '../measurement/selection/selection';
import {RangeFilter} from '../measurement/selection/range-filter';
import {View} from '../view/view';
import {RequestManager} from './request-manager';
import {CrudHandler} from './crud-handler';

export class RestClient implements SnailClient
{
    private readonly requestManager: RequestManager;
    private readonly projectCrud: CrudHandler<Project, ProjectDAO>;
    private readonly selectionCrud: CrudHandler<Selection, SelectionDAO>;
    private readonly measurementCrud: CrudHandler<Measurement, MeasurementDAO>;
    private readonly viewCrud: CrudHandler<View, ViewDAO>;

    constructor(url: string)
    {
        this.requestManager = new RequestManager(url);
        this.selectionCrud = new CrudHandler(this.requestManager, '/selections', parseSelection);
        this.projectCrud = new CrudHandler(this.requestManager, '/projects', parseProject);
        this.measurementCrud = new CrudHandler(this.requestManager, '/measurements', parseMeasurement);
        this.viewCrud = new CrudHandler(this.requestManager, '/views', parseView);
    }

    loginUser(username: string, password: string): Observable<User>
    {
        return this.requestManager.request('/login', 'POST', {
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
        return this.requestManager.request('/change-password', 'POST', {
            oldPassword,
            newPassword
        }, {
            token: user.token
        }).map(() => true);
    }

    createProject(user: User, name: string): Observable<boolean>
    {
        return this.projectCrud.create(user, {
            name
        }).map(() => true);
    }
    loadProjects(user: User): Observable<Project[]>
    {
        return this.projectCrud.load(user);
    }
    loadProject(user: User, name: string): Observable<Project>
    {
        return this.projectCrud.load(user, where({ name })).map(projects => {
            if (projects.length === 0)
            {
                throw new Error(`Project ${name} not found`);
            }
            return projects[0];
        });
    }

    loadUploadToken(user: User, project: Project): Observable<string>
    {
        return this.requestManager.request(`/get-upload-token/${project.id}`, 'GET', {}, {
            token: user.token
        }).map((token: string) => token);
    }
    regenerateUploadToken(user: User, project: Project): Observable<string>
    {
        return this.requestManager.request('/revoke-upload-token', 'POST', {
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
            ...where(buildRequestFilter(filters)),
            sort: '-timestamp'
        };

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
    deleteAllMeasurements(user: User): Observable<boolean>
    {
        return this.requestManager.request(`/clear-measurements`, 'POST', {}, {
            token: user.token
        }).map(() => true);
    }

    loadSelections(user: User, project: Project): Observable<Selection[]>
    {
       return this.selectionCrud.load(user, where(withProject(project)));
    }
    createSelection(user: User, project: Project, selection: Selection): Observable<Selection>
    {
        const args = withProject(project, serializeSelection(selection));
        return this.selectionCrud.create(user, args);
    }
    deleteSelection(user: User, selection: Selection): Observable<boolean>
    {
        return this.selectionCrud.delete(user, selection);
    }
    updateSelection(user: User, selection: Selection): Observable<boolean>
    {
        return this.selectionCrud.update(user, selection, serializeSelection(selection));
    }

    loadViews(user: User, project: Project): Observable<View[]>
    {
        return this.viewCrud.load(user, where(withProject(project)));
    }
    createViews(user: User, project: Project, view: View): Observable<View>
    {
        return this.viewCrud.create(user, withProject(project, serializeView(view)));
    }
    deleteViews(user: User, view: View): Observable<boolean>
    {
        return this.viewCrud.delete(user, view);
    }
    updateViews(user: User, view: View): Observable<boolean>
    {
        return this.viewCrud.update(user, view, serializeView(view));
    }
}
