import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {User} from '../user/user';
import {ArrayResponse, DAO} from './dao';
import {RequestManager} from './request-manager';

interface Identifiable {
    id: string;
}

export class CrudHandler<T extends Identifiable, D extends DAO>
{
    constructor(private requestManager: RequestManager,
                private url: string,
                private parse: (data: D) => T)
    {

    }

    load(user: User, args: {} = {}): Observable<T[]>
    {
        return this.requestManager.request(this.url, 'GET', args, {
            token: user.token
        }).pipe(
            map((data: ArrayResponse<D>) =>
                data._items
                    .map(v => this.parse(v))
            ));
    }
    create(user: User, item: {} = {}): Observable<T>
    {
        return this.requestManager.request(this.url, 'POST', item, {
            token: user.token
        }).pipe(
            map(this.parse));
    }
    delete(user: User, item: T): Observable<boolean>
    {
        return this.requestManager.request(`${this.url}/${item.id}`, 'DELETE', {}, {
            token: user.token
        }).pipe(map(() => true));
    }
    update(user: User, item: T, args: {}): Observable<boolean>
    {
        return this.requestManager.request(`${this.url}/${item.id}`, 'PATCH', args, {
            token: user.token
        }).pipe(map(() => true));
    }
}
