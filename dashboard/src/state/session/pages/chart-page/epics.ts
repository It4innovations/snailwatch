import {combineEpics} from 'redux-observable';
import {EMPTY, from, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {Action, Success} from 'typescript-fsa';
import {BatchedMeasurements} from '../../../../lib/api/snail-client';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {ofAction, ofActions} from '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {isBlank} from '../../../../util/string';
import {AppEpic} from '../../../app/app-epic';
import {AppState} from '../../../app/reducers';
import {deselectProject} from '../../project/actions';
import {getSelectedProject} from '../../project/reducers';
import {getToken} from '../../user/reducers';
import {ViewActions} from '../../view/actions';
import {getViews} from '../../view/reducers';
import {changeRangeFilterAction} from '../actions';
import {deleteAllMeasurementsAction, deleteMeasurementAction} from '../measurements-page/actions';
import {getRangeFilter} from '../reducers';
import {
    reloadViewMeasurementsAction,
    selectChartViewAction,
    selectViewAction,
    setAllViewsActiveAction,
    updateChartXAxisSettingsAction,
    updateSelectedViewsAction
} from './actions';
import {
    addToActiveViews,
    clearCache,
    getActiveViews,
    getMeasurementsRecord,
    insertMeasurementsRecord
} from './dataset-cache';
import {getChartState} from './reducer';

function getDirtyViews(state: AppState, rangeFilter: RangeFilter, newViews: string[]): View[]
{
    addToActiveViews(newViews);

    const views = getViews(state);
    const viewMap = new Map();

    for (const view of views)
    {
        viewMap.set(view.id, view);
    }

    const selected = getActiveViews()
        .map(id => viewMap.get(id))
        .filter(v => v !== undefined);

    return selected.filter(v => getMeasurementsRecord(v, rangeFilter) === null);
}
function getMeasurements(batch: BatchedMeasurements, view: View): Measurement[]
{
    if (!batch.views.hasOwnProperty(view.id)) return [];

    return batch.views[view.id].map(id => batch.measurements[id]);
}

const reloadViews = createRequestEpic(reloadViewMeasurementsAction, (action, store, deps) => {
    const rangeFilter = action.payload.rangeFilter;
    const state = store.value;
    const dirtyViews = getDirtyViews(state, rangeFilter, action.payload.views);

    if (dirtyViews.length === 0) return of(getViews(state));

    const dirtyViewSet = new Set(dirtyViews.map(v => v.id));
    const token = getToken(state);
    const project = getSelectedProject(state);

    function mapViews<T>(t: T, extractMeasurements: (t: T, view: View) => Measurement[])
    {
        return getViews(store.value).map(v => {
            if (!dirtyViewSet.has(v.id)) return v;
            const measurements = extractMeasurements(t, v);
            insertMeasurementsRecord(v, rangeFilter, measurements);

            return {
                ...v,
                measurements
            };
        });
    }

    if (dirtyViews.length === 1)
    {
        return deps.client.loadMeasurements(token, project, dirtyViews[0], rangeFilter)
            .pipe(map(measurements => mapViews(measurements, m => m)));
    }
    else
    {
        return deps.client.loadMeasurementsBatched(token, project, dirtyViews, rangeFilter)
            .pipe(map(batched => mapViews(batched, (m, v) => getMeasurements(m, v))));
    }
}, true);

const setAllViewsActive: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(setAllViewsActiveAction),
        map(() => reloadViewMeasurementsAction.started({
            rangeFilter: getRangeFilter(store.value),
            views: getViews(store.value).map(v => v.id)
        }))
    );

const handleViewGridChartSelect: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(selectChartViewAction),
        switchMap(action =>
            from([
                updateChartXAxisSettingsAction({
                    ...getChartState(store.value).xAxisSettings,
                    xAxis: action.payload.xAxis
                }),
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
                updateChartXAxisSettingsAction({
                    ...getChartState(store.value).xAxisSettings,
                    xAxis
                }),
                updateSelectedViewsAction([action.payload.viewId])
            ]);
        })
    );

const reloadDatasetsAfterViewChange: AppEpic = (action$, store) =>
    action$.pipe(
        ofActions([ViewActions.create.done, ViewActions.update.done]),
        map((action: Action<Success<View, View>>) => reloadViewMeasurementsAction.started({
            rangeFilter: getRangeFilter(store.value),
            views: [action.payload.result.id]
        }))
    );

const reloadDatasetsAfterSelectedViewsChange: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(updateSelectedViewsAction),
        map(() => reloadViewMeasurementsAction.started({
            rangeFilter: getRangeFilter(store.value),
            views: getChartState(store.value).selectedViews
        }))
    );

const reloadDatasetsAfterRangeFilterChange: AppEpic = action$ =>
    action$.pipe(
        ofAction(changeRangeFilterAction),
        map(action => reloadViewMeasurementsAction.started({
            rangeFilter: action.payload,
            views: []
        }))
    );

const clearCacheAfterMeasurementDelete: AppEpic = action$ =>
    action$.pipe(
        ofActions([deleteMeasurementAction.done, deleteAllMeasurementsAction.done, deselectProject]),
        tap(() => {
            clearCache();
        }),
        switchMap(() => EMPTY)
    );

export const chartEpics = combineEpics(
    clearCacheAfterMeasurementDelete,
    handleViewSelect,
    handleViewGridChartSelect,
    reloadViews,
    reloadDatasetsAfterViewChange,
    reloadDatasetsAfterSelectedViewsChange,
    reloadDatasetsAfterRangeFilterChange,
    setAllViewsActive
);
