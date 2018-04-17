import {combineEpics} from 'redux-observable';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import {createRequestEpic} from '../../../util/request';
import {addLineChartDatasetAction, reloadDatasetsAction, updateLineChartDatasetAction} from './actions';
import {Observable} from 'rxjs/Observable';
import {getSelectionById, getSelections} from '../../selection/reducer';
import {AppState} from '../../app/reducers';
import {Selection} from '../../../lib/measurement/selection/selection';

function getSelection(state: AppState, selectionId: string): Selection | null
{
    return selectionId === '' ? null : getSelectionById(getSelections(state), selectionId);
}

const loadInitialMeasurements = createRequestEpic(addLineChartDatasetAction, (action, state, deps) => {
    const {user, project, rangeFilter} = action.payload;
    return deps.client.loadMeasurements(user, project, null, rangeFilter)
        .map(measurements => ({
            measurements,
            name: '',
            selectionId: '',
            yAxis: ''
        }));
});

const loadMeasurementAfterUpdate = createRequestEpic(updateLineChartDatasetAction, (action, state, deps) => {
    const {user, project, selectionId, rangeFilter, dataset, yAxis} = action.payload;
    if (dataset.selectionId !== selectionId)
    {
        const selection = getSelection(state, selectionId);
        return deps.client.loadMeasurements(user, project, selection, rangeFilter)
            .map(measurements => ({
                    ...dataset,
                    selectionId,
                    measurements,
                    yAxis
            }));
    }
    else return Observable.of({
        ...dataset,
        yAxis
    });
});

const reloadDatasets = createRequestEpic(reloadDatasetsAction, (action, state, deps) => {
    const {user, project, rangeFilter} = action.payload;
    const datasets = state.ui.lineChartPage.datasets;

    return datasets.length === 0 ? Observable.of([]) : Observable.forkJoin(datasets.map(dataset => {
        const selection = getSelection(state, dataset.selectionId);
        return deps.client.loadMeasurements(user, project, selection, rangeFilter)
            .map(measurements => ({
                ...dataset,
                measurements
            }));
    }));
});

export const lineChartEpics = combineEpics(
    loadInitialMeasurements,
    loadMeasurementAfterUpdate,
    reloadDatasets
);
