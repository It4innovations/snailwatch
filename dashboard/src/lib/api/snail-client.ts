import {Observable} from 'rxjs/Observable';
import {Project} from '../project/project';
import {User} from '../user/user';

export interface SnailClient
{
    loginUser(username: string, password: string): Observable<string>;
    loadProjects(user: User): Observable<Project[]>;
}
