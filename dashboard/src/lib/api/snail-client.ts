import {Observable} from 'rxjs';
import {Measurement} from '../measurement/measurement';
import {Project} from '../project/project';
import {User} from '../user/user';
import {RangeFilter} from '../view/range-filter';
import {View} from '../view/view';

export interface SnailClient
{
    loginUser(username: string, password: string): Observable<User>;
    changePassword(user: User, oldPassword: string, newPassword: string): Observable<boolean>;

    createProject(user: User, project: Project): Observable<Project>;
    loadProjects(user: User): Observable<Project[]>;
    loadProject(user: User, name: string): Observable<Project>;
    updateProject(user: User, project: Project): Observable<boolean>;

    regenerateUploadToken(user: User, project: Project): Observable<string>;

    loadMeasurements(user: User, project: Project,
                     view: View,
                     range: RangeFilter): Observable<Measurement[]>;
    deleteMeasurement(user: User, measurement: Measurement): Observable<boolean>;
    deleteProjectMeasurements(user: User, project: Project): Observable<boolean>;

    loadViews(user: User, project: Project): Observable<View[]>;
    createView(user: User, project: Project, view: View): Observable<View>;
    deleteView(user: User, view: View): Observable<boolean>;
    updateView(user: User, view: View): Observable<boolean>;
}
