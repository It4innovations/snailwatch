import {ActionsObservable, StateObservable} from 'redux-observable';
import {Observable, of, Subject, throwError} from 'rxjs';
import {delay, map} from 'rxjs/operators';
import {TestScheduler} from 'rxjs/testing';
import actionCreatorFactory, {Action} from 'typescript-fsa';
import {ApiError} from '../lib/errors/api';
import {AppEpic} from '../state/app/app-epic';
import {ServiceContainer} from '../state/app/di';
import {AppState} from '../state/app/reducers';
import {clearSession} from '../state/session/actions';
import {createRequestEpic, createRequestEpicOptimistic} from '../util/request';

function testEpic(epic: AppEpic,
                  input: (hot: typeof TestScheduler.prototype.createHotObservable) => Observable<{}>,
                  marble: string,
                  marbleData: {},
                  state: AppState = null,
                  deps: ServiceContainer = {} as ServiceContainer)
{
    const testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
    });

    const store = new StateObservable(Subject.create(), state);

    testScheduler.run(({ hot, cold, expectObservable }) => {
        const output$ = epic(input(hot) as ActionsObservable<Action<{}>>, store, deps);
        expectObservable(output$).toBe(marble, marbleData);
    });
}

const factory = actionCreatorFactory('test');
const action = factory.async<string, number>('a1');

describe('createRequestEpic', () =>
{
    it('It returns done action when correct result is received', () =>
    {
        testEpic(
            createRequestEpic(action, () => of(5)),
            hot => hot('a', {
                a: action.started('x')
            }),
            'a',
            {
                a: action.done({
                    params: 'x',
                    result: 5
                })
            }
        );
    });
    it('It returns failed action when an error is thrown', () =>
    {
        testEpic(
            createRequestEpic(action, () => throwError('error')),
            hot => hot('a', {
                a: action.started('x')
            }),
            'a',
            {
                a: action.failed({
                    params: 'x',
                    error: 'error'
                })
            }
        );
    });
    it('It ignores subsequent actions when refreshRequests is false', () =>
    {
        testEpic(
            createRequestEpic(action, () => of(5).pipe(delay(2)), false),
            hot => hot('aa', {
                a: action.started('x')
            }),
            '--a',
            {
                a: action.done({
                    params: 'x',
                    result: 5
                })
            }
        );
    });
    it('It refreshes actions when refreshRequests is true', () =>
    {
        testEpic(
            createRequestEpic(action, () => of(5).pipe(delay(2)), true),
            hot => hot('ab', {
                a: action.started('x'),
                b: action.started('y')
            }),
            '---a',
            {
                a: action.done({
                    params: 'y',
                    result: 5
                })
            }
        );
    });
    it('It clears the session after a HTTP 401 error', () =>
    {
        const error = new ApiError(401, 'error');
        testEpic(
            createRequestEpic(action, () => throwError(error), true),
            hot => hot('a', {
                a: action.started('x')
            }),
            '(ab)',
            {
                a: action.failed({
                    params: 'x',
                    error
                }),
                b: clearSession()
            }
        );
    });
});

describe('createRequestEpicOptimistic', () =>
{
    it('It immediately returns optimistic done', () =>
    {
        testEpic(
            createRequestEpicOptimistic(action, () => of(5).pipe(delay(2)),
                () => 3,
                (a) => of(action.done({ params: a.payload, result: 4 }))
            ),
            hot => hot('a', {
                a: action.started('x')
            }),
            'a-b',
            {
                a: action.done({
                    params: 'x',
                    result: 3
                }),
                b: action.done({
                    params: 'x',
                    result: 5
                })
            }
        );
    });
    it('It reverts the original state when a failure occurs', () =>
    {
        testEpic(
            createRequestEpicOptimistic(action, () => of(5).pipe(
                    delay(2),
                    map(() => { throw 'error'; })
                ),
                () => 3,
                (a) => of(action.done({ params: a.payload, result: 4 }))
            ),
            hot => hot('a', {
                a: action.started('x')
            }),
            'a-(bc)',
            {
                a: action.done({
                    params: 'x',
                    result: 3
                }),
                b: action.done({
                    params: 'x',
                    result: 4
                }),
                c: action.failed({
                    params: 'x',
                    error: 'error'
                })
            }
        );
    });
});
