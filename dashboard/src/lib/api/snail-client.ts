import {Observable} from 'rxjs/Observable';
import {Project} from '../project/project';
import {User} from '../user/user';
import {Measurement} from '../measurement/measurement';
import {Filter} from '../view/filter';

export interface FetchResult<T>
{
    items: T[];
    total: number;
}

export interface SnailClient
{
    loginUser(username: string, password: string): Observable<User>;

    createProject(user: User, name: string): Observable<boolean>;
    loadProjects(user: User): Observable<Project[]>;
    loadProject(user: User, name: string): Observable<Project>;

    loadMeasurements(user: User, project: Project,
                     filters: Filter[],
                     sortBy: string,
                     page: number,
                     count: number): Observable<FetchResult<Measurement>>;
}
