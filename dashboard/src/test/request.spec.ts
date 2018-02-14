import actionCreatorFactory, {Action, Failure, Success} from 'typescript-fsa';
import {createRequestEpic, mapRequestToActions} from '../util/request';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import {ActionsObservable} from 'redux-observable';
import {Store} from 'redux';
import {AppState} from '../state/app/reducers';

const factory = actionCreatorFactory('request-test');
const creator = factory.async<string, number>('action');

describe('mapRequestToActions', () =>
{
    it('Creates done action after successful request', done =>
    {
        const action = {
            type: creator.type,
            payload: 'data'
        };
        const response = 5;

        mapRequestToActions(creator, action, Observable.of(response))
            .subscribe(result => {
                const res = result as Action<Success<string, number>>;

                expect(res.type).toEqual(creator.done.type);
                expect(res.payload.params).toEqual(action.payload);
                expect(res.payload.result).toEqual(response);

                done();
            });
    });

    it('Creates failed action after unsuccessful request', done =>
    {
        const action = {
            type: creator.type,
            payload: 'data'
        };
        const error = 'error';

        mapRequestToActions(creator, action, Observable.throw(error))
            .subscribe(result => {
                const res = result as Action<Failure<string, string>>;

                expect(res.type).toEqual(creator.failed.type);
                expect(res.payload.params).toEqual(action.payload);
                expect(res.payload.error).toEqual(error);

                done();
            });
    });
});

describe('createRequestEpic', () => {
    it('Starts request after started action', done => {
        const action$ = ActionsObservable.of({
            type: creator.started.type,
            payload: 'test'
        });

        const epic = createRequestEpic(creator, (action) => {
            expect(action.payload).toEqual('test');

            return Observable.of(0);
        });
        epic(action$, {
            getState: () => {}
        } as Store<AppState>, null).subscribe(() => {
            done();
        });
    });
});
