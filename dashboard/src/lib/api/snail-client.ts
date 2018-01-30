import {Observable} from 'rxjs/Observable';
import {Project} from '../project/project';
import {User} from '../user/user';
import {Measurement} from '../measurement/measurement';

export interface SnailClient
{
    loginUser(username: string, password: string): Observable<User>;

    createProject(user: User, name: string): Observable<boolean>;
    loadProjects(user: User): Observable<Project[]>;
    loadProject(user: User, name: string): Observable<Project>;

    loadMeasurements(user: User, project: Project): Observable<Measurement[]>;
}
