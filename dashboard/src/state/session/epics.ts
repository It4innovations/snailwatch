import {combineEpics} from 'redux-observable';
import {EMPTY, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ofAction} from '../../util/redux-observable';
import {AppEpic} from '../app/app-epic';
import {initProjectSession, initUserSession} from './actions';
import {chartEpics} from './pages/chart-page/epics';
import {gridChartPageEpics} from './pages/grid-chart-page/epics';
import {measurementsEpics} from './pages/measurements-page/epics';
import {ProjectActions} from './project/actions';
import {projectEpics} from './project/epics';
import {getSelectedProject} from './project/reducer';
import {userEpics} from './user/epics';
import {isUserAuthenticated} from './user/reducer';
import {ViewActions} from './view/actions';
import {analysisEpics} from './view/epics';

const initUserSessionEpic: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(initUserSession),
        switchMap(() => {
            if (isUserAuthenticated(store.value))
            {
                return of(ProjectActions.load.started());
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
                return of(ViewActions.load.started());
            }
            return EMPTY;
        })
    );

export const sessionEpics = combineEpics(
    initUserSessionEpic,
    initProjectSessionEpic,
    userEpics,
    analysisEpics,
    projectEpics,
    chartEpics,
    gridChartPageEpics,
    measurementsEpics
);
