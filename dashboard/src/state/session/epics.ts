import {combineEpics} from 'redux-observable';
import {EMPTY, from} from 'rxjs';
import {fromPromise} from 'rxjs/internal-compatibility';
import {catchError, switchMap} from 'rxjs/operators';
import {SnailClient} from '../../lib/api/snail-client';
import {Measurement} from '../../lib/measurement/measurement';
import {createEntryRangeFilter, RangeFilter} from '../../lib/view/range-filter';
import {View} from '../../lib/view/view';
import {ofAction} from '../../util/redux-observable';
import {AppEpic} from '../app/app-epic';
import {AppState} from '../app/reducers';
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

async function initProject(client: SnailClient, state: AppState, range: RangeFilter): Promise<{
    views: View[],
    globalMeasurements: Measurement[]
}>
{
    // TODO: load in parallel

    const views = await client.loadViews(getToken(state), getSelectedProject(state)).toPromise();
    const measurements = await client.loadMeasurements(getToken(state), getSelectedProject(state), null,
        range).toPromise();

    return Promise.resolve({
        views,
        globalMeasurements: measurements
    });
}

// TODO: refactor
const initProjectSessionEpic: AppEpic = (action$, store, deps) =>
    action$.pipe(
        ofAction(initProjectSession.started),
        switchMap(() => {
            const project = getSelectedProject(store.value);
            if (isUserAuthenticated(store.value) && project !== null)
            {
                const range = createEntryRangeFilter(1000);
                return fromPromise(initProject(deps.client, store.value, range)).pipe(
                    switchMap(({views, globalMeasurements}) =>
                        from([
                            ViewActions.load.done({
                                params: {},
                                result: views
                            }),
                            loadGlobalMeasurements.done({
                                params: range,
                                result: globalMeasurements
                            }),
                            reloadViewMeasurementsAction.started({
                                rangeFilter: getRangeFilter(store.value),
                                views: getChartState(store.value).selectedViews
                            }),
                            initProjectSession.done({
                                params: {},
                                result: {}
                            })
                        ])
                    ),
                    catchError(error => from([
                        ViewActions.load.failed({
                            params: {},
                            error
                        }),
                        loadGlobalMeasurements.failed({
                            params: range,
                            error
                        }),
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
