import {combineEpics} from 'redux-observable';
import {EMPTY, forkJoin, from, of} from 'rxjs';
import {catchError, map, mergeMap, switchMap} from 'rxjs/operators';
import {createEntryRangeFilter} from '../../lib/view/range-filter';
import {ofAction} from '../../util/redux-observable';
import {AppEpic} from '../app/app-epic';
import {initProjectSession, initUserSession} from './actions';
import {loadGlobalMeasurements} from './pages/actions';
import {reloadViewMeasurementsAction} from './pages/chart-page/actions';
import {chartEpics} from './pages/chart-page/epics';
import {getChartState} from './pages/chart-page/reducer';
import {pageEpics} from './pages/epics';
import {measurementsEpics} from './pages/measurements-page/epics';
import {getRangeFilter} from './pages/reducers';
import {ProjectActions} from './project/actions';
import {projectEpics} from './project/epics';
import {getSelectedProject} from './project/reducers';
import {UserActions} from './user/actions';
import {userEpics} from './user/epics';
import {getToken, getUser, isUserAuthenticated} from './user/reducers';
import {ViewActions} from './view/actions';
import {viewEpics} from './view/epics';

const initUserSessionEpic: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(initUserSession),
        switchMap(() => {
            if (isUserAuthenticated(store.value))
            {
                return from([
                    UserActions.loadOne.started(getUser(store.value).id),
                    ProjectActions.load.started()
                ]);
            }
            return EMPTY;
        })
    );

const initProjectSessionEpic: AppEpic = (action$, store, deps) =>
    action$.pipe(
        ofAction(initProjectSession.started),
        switchMap(() => {
            const project = getSelectedProject(store.value);
            if (isUserAuthenticated(store.value) && project !== null)
            {
                const range = createEntryRangeFilter(1000);
                return forkJoin([
                    deps.client.loadViews(getToken(store.value), getSelectedProject(store.value)),
                    deps.client.loadMeasurements(getToken(store.value), getSelectedProject(store.value),
                        null, range)
                ]).pipe(
                    map(([views, measurements]) => [
                        ViewActions.load.done({
                            params: {},
                            result: views
                        }),
                        loadGlobalMeasurements.done({
                            params: range,
                            result: measurements
                        }),
                        reloadViewMeasurementsAction.started({
                            rangeFilter: getRangeFilter(store.value),
                            views: getChartState(store.value).selectedViews
                        })
                    ]),
                    catchError(error => of([
                        ViewActions.load.failed({
                            params: {},
                            error
                        }
                    )])),
                    mergeMap(actions => from([
                        ...actions,
                        initProjectSession.done({
                            params: {},
                            result: {}
                        })
                    ]))
                );
            }
            return EMPTY;
        })
    );

export const sessionEpics = combineEpics(
    initUserSessionEpic,
    initProjectSessionEpic,
    userEpics,
    viewEpics,
    projectEpics,
    chartEpics,
    pageEpics,
    measurementsEpics
);
