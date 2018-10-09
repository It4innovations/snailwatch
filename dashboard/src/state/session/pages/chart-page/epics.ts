import {combineEpics} from 'redux-observable';
import {EMPTY, from, of} from 'rxjs';
import {map, switchMap, tap} from 'rxjs/operators';
import {BatchedMeasurements} from '../../../../lib/api/snail-client';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/view/range-filter';
import {View} from '../../../../lib/view/view';
import {ofAction, ofActions} from '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {isBlank} from '../../../../util/string';
import {AppEpic} from '../../../app/app-epic';
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
    updateChartXAxisSettingsAction,
    updateSelectedViewsAction
} from './actions';
import {clearCache, getMeasurementsRecord, insertMeasurementsRecord} from './dataset-cache';
import {getChartState} from './reducer';

function getDirtyViews(views: View[], rangeFilter: RangeFilter): View[]
{
    return views.filter(v => getMeasurementsRecord(v, rangeFilter) === null);
}
function getMeasurements(batch: BatchedMeasurements, view: View): Measurement[]
{
    if (!batch.views.hasOwnProperty(view.id)) return [];

    return batch.views[view.id].map(id => batch.measurements[id]);
}

const reloadViews = createRequestEpic(reloadViewMeasurementsAction, (action, store, deps) => {
    const rangeFilter = action.payload;
    const state = store.value;
    const views = getViews(state);
    const dirtyViews = getDirtyViews(views, rangeFilter);

    if (dirtyViews.length === 0) return of(views);

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
        map(() => reloadViewMeasurementsAction.started(getRangeFilter(store.value)))
    );

const reloadDatasetsAfterRangeFilterChange: AppEpic = action$ =>
    action$.pipe(
        ofAction(changeRangeFilterAction),
        map(action => reloadViewMeasurementsAction.started(action.payload))
    );


const clearCacheAfterMeasurementDelete: AppEpic = action$ =>
    action$.pipe(
        ofActions([deleteMeasurementAction.done, deleteAllMeasurementsAction.done]),
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
    reloadDatasetsAfterRangeFilterChange,
    reloadDatasetsAfterViewChange
);
