import {Observable} from 'rxjs';
import {Measurement} from '../measurement/measurement';
import {Project} from '../project/project';
import {User} from '../user/user';
import {RangeFilter} from '../view/range-filter';
import {View} from '../view/view';

export interface SnailClient
{
    loadUser(token: string, id: string): Observable<User>;
    updateUser(token: string, user: User): Observable<boolean>;
    loginUser(username: string, password: string): Observable<{ user: User, token: string }>;
    changePassword(token: string, oldPassword: string, newPassword: string): Observable<boolean>;

    createProject(token: string, project: Project): Observable<Project>;
    loadProjects(token: string): Observable<Project[]>;
    loadProject(token: string, name: string): Observable<Project>;
    updateProject(token: string, project: Project): Observable<boolean>;

    regenerateUploadToken(token: string, project: Project): Observable<string>;

    loadMeasurements(token: string, project: Project,
                     view: View,
                     range: RangeFilter): Observable<Measurement[]>;
    deleteMeasurement(token: string, measurement: Measurement): Observable<boolean>;
    deleteProjectMeasurements(token: string, project: Project): Observable<boolean>;

    loadViews(token: string, project: Project): Observable<View[]>;
    createView(token: string, project: Project, view: View): Observable<View>;
    deleteView(token: string, view: View): Observable<boolean>;
    updateView(token: string, view: View): Observable<boolean>;
}
