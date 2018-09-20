import {combineEpics} from 'redux-observable';
import {EMPTY, from} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {createEntryRangeFilter} from '../../lib/view/range-filter';
import {ofAction} from '../../util/redux-observable';
import {AppEpic} from '../app/app-epic';
import {initProjectSession, initUserSession} from './actions';
import {loadGlobalMeasurements} from './pages/actions';
import {chartEpics} from './pages/chart-page/epics';
import {pageEpics} from './pages/epics';
import {gridChartPageEpics} from './pages/grid-chart-page/epics';
import {measurementsEpics} from './pages/measurements-page/epics';
import {ProjectActions} from './project/actions';
import {projectEpics} from './project/epics';
import {getSelectedProject} from './project/reducer';
import {UserActions} from './user/actions';
import {userEpics} from './user/epics';
import {getUser, isUserAuthenticated} from './user/reducer';
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

const initProjectSessionEpic: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(initProjectSession),
        switchMap(() => {
            const project = getSelectedProject(store.value);
            if (isUserAuthenticated(store.value) && project !== null)
            {
                return from([
                    ViewActions.load.started(),
                    loadGlobalMeasurements.started(createEntryRangeFilter(2000))
                ]);
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
    gridChartPageEpics,
    measurementsEpics
);
