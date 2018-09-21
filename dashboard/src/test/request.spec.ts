import moment from 'moment';
import {createStore} from 'redux';
import {ActionsObservable, StateObservable} from 'redux-observable';
import {of as observableOf, throwError as observableThrowError} from 'rxjs';
import actionCreatorFactory, {Action, Failure, Success} from 'typescript-fsa';
import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {selectActiveRequest} from '../components/global/request/multi-request-component';
import {AppState} from '../state/app/reducers';
import {createRequest, createRequestEpic, hookRequestActions, mapRequestToActions} from '../util/request';

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

        mapRequestToActions(creator, action, observableOf(response))
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

        mapRequestToActions(creator, action, observableThrowError(error))
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

            return observableOf(0);
        });
        epic(action$, {
            value: {}
        } as StateObservable<AppState>, null).subscribe(() => {
            done();
        });
    });
});

describe('hookRequestActions', () => {
    const createReducer = () =>
    {
        let reducer = reducerWithInitialState({
            request: createRequest()
        });

        return hookRequestActions(reducer,
            creator,
            r => r.request,
        );
    };
    const makeStore = () => createStore(createReducer());

    it('Set\'s request loading to true after start', () => {
        const store = makeStore();
        store.dispatch(creator.started(''));

        expect(store.getState().request.completed).toEqual(false);
        expect(store.getState().request.loading).toEqual(true);
        expect(store.getState().request.error).toEqual(null);
    });
    it('Set\'s completed after error', () => {
        const store = makeStore();
        store.dispatch(creator.failed({
            params: '',
            error: 'error'
        }));

        expect(store.getState().request.completed).toEqual(true);
        expect(store.getState().request.loading).toEqual(false);
        expect(store.getState().request.error).toEqual('error');
    });
    it('Set\'s completed after success', () => {
        const store = makeStore();
        store.dispatch(creator.done({
            params: '',
            result: 0
        }));

        expect(store.getState().request.completed).toEqual(true);
        expect(store.getState().request.loading).toEqual(false);
        expect(store.getState().request.error).toEqual(null);
    });
});

describe('selectActiveRequest', () => {
    it('Returns null for empty request array', () => {
        expect(selectActiveRequest([])).toBe(null);
    });
    it('Chooses the latest completed request if there\'s no loading', () => {
        const requests = [
            createRequest({
                completed: true,
                finishedAt: moment().subtract(2, 'minute')
            }),
            createRequest(),
            createRequest({
                completed: true,
                finishedAt: moment().subtract(1, 'minute')
            })
        ];

        expect(selectActiveRequest(requests)).toEqual(requests[2]);
    });
    it('Chooses the first loading request', () => {
        const requests = [
            createRequest({
                completed: true,
                finishedAt: moment().subtract(2, 'minute')
            }),
            createRequest({
                loading: true
            }),
            createRequest({
                completed: true,
                finishedAt: moment().subtract(1, 'minute')
            })
        ];

        expect(selectActiveRequest(requests)).toEqual(requests[1]);
    });
});
