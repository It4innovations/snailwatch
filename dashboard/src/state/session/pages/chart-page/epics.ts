import {Action as ReduxAction, Store} from 'redux';
import {ActionsObservable, combineEpics} from 'redux-observable';
import '../../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import {View} from '../../../../lib/view/view';
import {getNextId} from '../../../../util/database';
import {createRequestEpic} from '../../../../util/request';
import {getViewById, getViews} from '../../view/reducer';
import {getRangeFilter} from '../reducers';
import {
    addChartDatasetAction,
    reloadChartDatasetsAction,
    selectChartViewAction,
    updateChartDatasetAction
} from './actions';
import {Observable} from 'rxjs/Observable';
import {getSelectionById, getSelections} from '../../selection/reducer';
import {AppState} from '../../../app/reducers';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {getUser} from '../../user/reducer';
import {getSelectedProject} from '../../project/reducer';

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

    return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter)
        .map(measurements => ({
            id: getNextId(state.session.pages.chartState.datasets),
            view: viewId,
            measurements
        }));
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
        return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter)
            .map(measurements => ({
                    ...updated,
                    measurements
            }));
    }
    else return Observable.of(updated);
});

const reloadDatasets = createRequestEpic(reloadChartDatasetsAction, (action, state, deps) => {
    const {rangeFilter} = action.payload;
    const datasets = state.session.pages.chartState.datasets;

    return datasets.length === 0 ? Observable.of([]) : Observable.forkJoin(datasets.map(dataset => {
        const view = getView(state, dataset.view);
        const selection = getSelection(state, view === null ? null : view.selection);
        return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter)
            .map(measurements => ({
                ...dataset,
                measurements
            }));
    }));
});

const reloadAfterSelect = (action$: ActionsObservable<ReduxAction>,
                           state: Store<AppState>) =>
    action$
        .ofAction(selectChartViewAction)
        .map(() => reloadChartDatasetsAction.started({
            rangeFilter: getRangeFilter(state.getState())
        }));

export const chartEpics = combineEpics(
    addDataset,
    updateDataset,
    reloadDatasets,
    reloadAfterSelect
);
