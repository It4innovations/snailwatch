import {Observable} from 'rxjs/Observable';
import {Project} from '../project/project';
import {User} from '../user/user';
import {Measurement} from '../measurement/measurement';
import {Filter} from '../view/filter';
import {Selection} from '../view/view';

export interface FetchResult<T>
{
    items: T[];
    total: number;
}

export interface SnailClient
{
    loginUser(username: string, password: string): Observable<User>;
    changePassword(user: User, oldPassword: string, newPassword: string): Observable<boolean>;

    createProject(user: User, name: string): Observable<boolean>;
    loadProjects(user: User): Observable<Project[]>;
    loadProject(user: User, name: string): Observable<Project>;

    loadUploadToken(user: User, project: Project): Observable<string>;
    regenerateUploadToken(user: User, project: Project): Observable<string>;

    loadMeasurements(user: User, project: Project,
                     filters: Filter[],
                     sortBy: string,
                     page: number,
                     count: number): Observable<FetchResult<Measurement>>;
    deleteMeasurement(user: User, measurement: Measurement): Observable<boolean>;


    loadSelections(user: User, project: Project): Observable<Selection[]>;
    createSelection(user: User, project: Project, view: Selection): Observable<Selection>;
    deleteSelection(user: User, view: Selection): Observable<boolean>;
    updateSelection(user: User, view: Selection): Observable<boolean>;
}
