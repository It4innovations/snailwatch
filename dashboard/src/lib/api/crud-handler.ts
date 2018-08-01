import {User} from '../user/user';
import {Observable} from 'rxjs/Observable';
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
        })
            .map((data: ArrayResponse<D>) =>
                data._items
                    .map(v => this.parse(v))
            );
    }
    create(user: User, item: {} = {}): Observable<T>
    {
        return this.requestManager.request(this.url, 'POST', item, {
            token: user.token
        })
            .map(this.parse);
    }
    delete(user: User, item: T): Observable<boolean>
    {
        return this.requestManager.request(`${this.url}/${item.id}`, 'DELETE', {}, {
            token: user.token
        }).map(() => true);
    }
    update(user: User, item: T, args: {}): Observable<boolean>
    {
        return this.requestManager.request(`${this.url}/${item.id}`, 'PATCH', args, {
            token: user.token
        }).map(() => true);
    }
}
