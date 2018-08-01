import {Observable} from 'rxjs/Observable';
import {Project} from '../project/project';
import {User} from '../user/user';
import {Measurement} from '../measurement/measurement';
import {Selection} from '../measurement/selection/selection';
import {RangeFilter} from '../measurement/selection/range-filter';
import {View} from '../view/view';

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
                     selection: Selection,
                     range: RangeFilter): Observable<Measurement[]>;
    deleteMeasurement(user: User, measurement: Measurement): Observable<boolean>;
    deleteAllMeasurements(user: User): Observable<boolean>;

    loadSelections(user: User, project: Project): Observable<Selection[]>;
    createSelection(user: User, project: Project, selection: Selection): Observable<Selection>;
    deleteSelection(user: User, view: Selection): Observable<boolean>;
    updateSelection(user: User, view: Selection): Observable<boolean>;

    loadViews(user: User, project: Project): Observable<View[]>;
    createView(user: User, project: Project, view: View): Observable<View>;
    deleteView(user: User, view: View): Observable<boolean>;
    updateView(user: User, view: View): Observable<boolean>;
}
