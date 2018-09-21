import {combineEpics} from 'redux-observable';
import {EMPTY, forkJoin as observableForkJoin, from, Observable, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {ofAction, ofActions} from '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {isBlank} from '../../../../util/string';
import {AppEpic} from '../../../app/app-epic';
import {ServiceContainer} from '../../../app/di';
import {AppState} from '../../../app/reducers';
import {getSelectedProject} from '../../project/reducer';
import {getToken} from '../../user/reducer';
import {ViewActions} from '../../view/actions';
import {getViews} from '../../view/reducer';
import {changeRangeFilterAction} from '../actions';
import {getRangeFilter} from '../reducers';
import {
    reloadViewMeasurementsAction,
    selectChartViewAction,
    selectViewAction,
    setChartXAxisAction,
    updateSelectedViewsAction,
} from './actions';
import {getMeasurementsRecord, insertMeasurementsRecord} from './dataset-cache';

function loadMeasurements(state: AppState, deps: ServiceContainer,
                          view: View, rangeFilter: RangeFilter): Observable<Measurement[]>
{
    const cache = getMeasurementsRecord(view, rangeFilter);
    if (cache !== null)
    {
        return of(cache);
    }

    return deps.client.loadMeasurements(getToken(state), getSelectedProject(state), view, rangeFilter).pipe(
        tap(measurements => {
            insertMeasurementsRecord(view, rangeFilter, measurements);
        })
    );
}

const reloadViews = createRequestEpic(reloadViewMeasurementsAction, (action, state, deps) => {
    const {rangeFilter} = action.payload;
    const views = getViews(state);

    return observableForkJoin(views.map(view => {
        return loadMeasurements(state, deps, view, rangeFilter).pipe(
            map(measurements => ({
                ...view,
                measurements
            }))
        );
    }));
});

const handleViewGridChartSelect: AppEpic = action$ =>
    action$.pipe(
        ofAction(selectChartViewAction),
        switchMap(action =>
            from([
                setChartXAxisAction(action.payload.xAxis),
                updateSelectedViewsAction([action.payload.view.id])
            ])
        )
    );

const handleViewSelect: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(selectViewAction),
        switchMap(action => {
            const project = getSelectedProject(store.value);
            if (!project) return EMPTY;

            const xAxis = isBlank(project.commitKey) ? 'timestamp' : project.commitKey; // TODO: get from URL?

            return from([
                setChartXAxisAction(xAxis),
                updateSelectedViewsAction([action.payload.viewId])
            ]);
        })
    );

const reloadDatasetsAfterViewChange: AppEpic = (action$, store) =>
    action$.pipe(
        ofActions([ViewActions.load.done, ViewActions.update.done, updateSelectedViewsAction]),
        map(() => reloadViewMeasurementsAction.started({
            rangeFilter: getRangeFilter(store.value)
        }))
    );

const reloadDatasetsAfterRangeFilterChange: AppEpic = action$ =>
    action$.pipe(
        ofAction(changeRangeFilterAction),
        map(action => reloadViewMeasurementsAction.started({
            rangeFilter: action.payload
        }))
    );

export const chartEpics = combineEpics(
    handleViewSelect,
    handleViewGridChartSelect,
    reloadViews,
    reloadDatasetsAfterViewChange,
    reloadDatasetsAfterRangeFilterChange
);
