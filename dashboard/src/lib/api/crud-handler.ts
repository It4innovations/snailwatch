import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
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

    load(token: string, args: {} = {}): Observable<T[]>
    {
        return this.requestManager.request(this.url, 'GET', args, {
            token
        }).pipe(
            map((data: ArrayResponse<D>) =>
                data._items
                    .map(v => this.parse(v))
            ));
    }
    loadOne(token: string, id: string): Observable<T>
    {
        return this.requestManager.request(`${this.url}/${id}`, 'GET', {}, {
            token
        }).pipe(
            map(this.parse)
        );
    }
    create(token: string, item: {} = {}): Observable<T>
    {
        return this.requestManager.request(this.url, 'POST', item, {
            token
        }).pipe(
            map(this.parse));
    }
    delete(token: string, item: T): Observable<boolean>
    {
        return this.requestManager.request(`${this.url}/${item.id}`, 'DELETE', {}, {
            token
        }).pipe(map(() => true));
    }
    update(token: string, item: T, args: {}): Observable<T>
    {
        return this.requestManager.request(`${this.url}/${item.id}`, 'PATCH', args, {
            token
        }).pipe(map(() => item));
    }
}
