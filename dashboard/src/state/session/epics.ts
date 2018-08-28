import {combineEpics} from 'redux-observable';
import {EMPTY, from} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {ofAction} from '../../util/redux-observable';
import {AppEpic} from '../app/app-epic';
import {initSession} from './actions';
import {reloadChartDatasetsAction} from './pages/chart-page/actions';
import {chartEpics} from './pages/chart-page/epics';
import {gridChartPageEpics} from './pages/grid-chart-page/epics';
import {measurementsEpics} from './pages/measurements-page/epics';
import {getRangeFilter} from './pages/reducers';
import {loadProject} from './project/actions';
import {projectEpics} from './project/epics';
import {getSelectedProject} from './project/reducer';
import {selectionEpics} from './selection/epics';
import {userEpics} from './user/epics';
import {isUserAuthenticated} from './user/reducer';
import {ViewActions} from './view/actions';
import {analysisEpics} from './view/epics';

const initSessionEpic: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(initSession),
        switchMap(() => {
            const project = getSelectedProject(store.value);
            if (isUserAuthenticated(store.value) && project !== null)
            {
                return from([
                    loadProject.started(project.name),
                    ViewActions.load.started(),
                    reloadChartDatasetsAction.started({
                        rangeFilter: getRangeFilter(store.value)
                    })
                ]);
            }
            else return EMPTY;
        })
    );

export const sessionEpics = combineEpics(
    initSessionEpic,
    userEpics,
    analysisEpics,
    selectionEpics,
    projectEpics,
    chartEpics,
    gridChartPageEpics,
    measurementsEpics
);
