import {combineEpics} from 'redux-observable';
import {forkJoin as observableForkJoin, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {View} from '../../../../lib/view/view';
import {getNextId} from '../../../../util/database';
import {ofAction} from '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {AppEpic} from '../../../app/app-epic';
import {AppState} from '../../../app/reducers';
import {getSelectedProject} from '../../project/reducer';
import {getSelectionById, getSelections} from '../../selection/reducer';
import {getUser} from '../../user/reducer';
import {getViewById, getViews} from '../../view/reducer';
import {getRangeFilter} from '../reducers';
import {
    addChartDatasetAction,
    reloadChartDatasetsAction,
    selectChartViewAction,
    updateChartDatasetAction
} from './actions';

function getSelection(state: AppState, selectionId: string): Selection | null
{
    return !selectionId ? null : getSelectionById(getSelections(state), selectionId);
}
function getView(state: AppState, viewId: string): View | null
{
    return !viewId ? null : getViewById(getViews(state), viewId);
}

const addDataset = createRequestEpic(addChartDatasetAction, (action, state, deps) => {
    const {rangeFilter, view: viewId} = action.payload;
    const view = getView(state, viewId);
    const selection = getSelection(state, view.selection);

    return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter).pipe(
        map(measurements => ({
            id: getNextId(state.session.pages.chartState.datasets),
            view: viewId,
            measurements
        })));
});

const updateDataset = createRequestEpic(updateChartDatasetAction, (action, state, deps) => {
    const {rangeFilter, dataset, view: viewId} = action.payload;
    const updated = {
        ...dataset,
        view: viewId
    };

    if (dataset.view !== viewId && viewId)
    {
        const view = getView(state, viewId);
        const selection = getSelection(state, view === null ? null : view.selection);
        return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter).pipe(
            map(measurements => ({
                    ...updated,
                    measurements
            })));
    }
    else return observableOf(updated);
});

const reloadDatasets = createRequestEpic(reloadChartDatasetsAction, (action, state, deps) => {
    const {rangeFilter} = action.payload;
    const datasets = state.session.pages.chartState.datasets;

    return datasets.length === 0 ? observableOf([]) : observableForkJoin(datasets.map(dataset => {
        const view = getView(state, dataset.view);
        const selection = getSelection(state, view === null ? null : view.selection);
        return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter).pipe(
            map(measurements => ({
                ...dataset,
                measurements
            })));
    }));
});

const reloadAfterSelect: AppEpic = (action$, store) =>
    action$.pipe(
        ofAction(selectChartViewAction),
        map(() => reloadChartDatasetsAction.started({
            rangeFilter: getRangeFilter(store.value)
        }))
    );

export const chartEpics = combineEpics(
    addDataset,
    updateDataset,
    reloadDatasets,
    reloadAfterSelect
);
