import {combineEpics} from 'redux-observable';
import {forkJoin as observableForkJoin, Observable, of, of as observableOf} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Measurement} from '../../../../lib/measurement/measurement';
import {RangeFilter} from '../../../../lib/measurement/selection/range-filter';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {View} from '../../../../lib/view/view';
import {getNextId} from '../../../../util/database';
import {ofAction} from '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {AppEpic} from '../../../app/app-epic';
import {ServiceContainer} from '../../../app/di';
import {AppState} from '../../../app/reducers';
import {getSelectedProject} from '../../project/reducer';
import {SelectionActions} from '../../selection/actions';
import {getSelectionById, getSelections} from '../../selection/reducer';
import {getUser} from '../../user/reducer';
import {getViewById, getViews} from '../../view/reducer';
import {changeRangeFilterAction} from '../actions';
import {getRangeFilter} from '../reducers';
import {
    addChartDatasetAction,
    reloadChartDatasetsAction,
    selectChartViewAction,
    updateChartDatasetAction
} from './actions';
import {getMeasurementsRecord, insertMeasurementsRecord} from './dataset-cache';

function getSelection(state: AppState, selectionId: string): Selection | null
{
    return !selectionId ? null : getSelectionById(getSelections(state), selectionId);
}
function getView(state: AppState, viewId: string): View | null
{
    return !viewId ? null : getViewById(getViews(state), viewId);
}

function loadMeasurements(state: AppState, deps: ServiceContainer,
                          selection: Selection, rangeFilter: RangeFilter): Observable<Measurement[]>
{
    const cache = getMeasurementsRecord(selection, rangeFilter);
    if (cache !== null)
    {
        return of(cache);
    }

    return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter).pipe(
        tap(measurements => {
            insertMeasurementsRecord(selection, rangeFilter, measurements);
        })
    );
}

const addDataset = createRequestEpic(addChartDatasetAction, (action, state, deps) => {
    const {rangeFilter, view: viewId} = action.payload;
    const view = getView(state, viewId);
    const selection = getSelection(state, view.selection);

    return loadMeasurements(state, deps, selection, rangeFilter).pipe(
        map(measurements => ({
            id: getNextId(state.session.pages.chartState.datasets),
            view: viewId,
            measurements
        }))
    );
});

const updateDataset = createRequestEpic(updateChartDatasetAction, (action, state, deps) => {
    const {rangeFilter, dataset, view: viewId} = action.payload;
    const updated = {
        ...dataset,
        view: viewId
    };

    const view = getView(state, viewId);
    const selection = getSelection(state, view === null ? null : view.selection);

    return loadMeasurements(state, deps, selection, rangeFilter).pipe(
        map(measurements => ({
            ...updated,
            measurements
        }))
    );
});

const reloadDatasets = createRequestEpic(reloadChartDatasetsAction, (action, state, deps) => {
    const {rangeFilter} = action.payload;
    const datasets = state.session.pages.chartState.datasets;

    return datasets.length === 0 ? observableOf([]) : observableForkJoin(datasets.map(dataset => {
        const view = getView(state, dataset.view);
        const selection = getSelection(state, view === null ? null : view.selection);

        return loadMeasurements(state, deps, selection, rangeFilter).pipe(
            map(measurements => ({
                ...dataset,
                measurements
            }))
        );
    }));
});

const reloadAfterSelect: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(selectChartViewAction),
        map(() => reloadChartDatasetsAction.started({
            rangeFilter: getRangeFilter(store.value)
        }))
    );

const reloadDatasetsAfterSelectionChange: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(SelectionActions.update.done),
        map(() => reloadChartDatasetsAction.started({
            rangeFilter: getRangeFilter(store.value)
        }))
    );

const reloadDatasetsAfterRangeFilterChange: AppEpic = action$ =>
    action$.pipe(
        ofAction(changeRangeFilterAction),
        map(action => reloadChartDatasetsAction.started({
            rangeFilter: action.payload
        }))
    );

export const chartEpics = combineEpics(
    addDataset,
    updateDataset,
    reloadDatasets,
    reloadAfterSelect,
    reloadDatasetsAfterSelectionChange,
    reloadDatasetsAfterRangeFilterChange
);
