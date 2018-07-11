import {combineEpics} from 'redux-observable';
import '../../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import {createRequestEpic} from '../../../../util/request';
import {addLineChartDatasetAction, reloadLineChartDatasetsAction, updateLineChartDatasetAction} from './actions';
import {Observable} from 'rxjs/Observable';
import {getSelectionById, getSelections} from '../../selection/reducer';
import {AppState} from '../../../app/reducers';
import {Selection} from '../../../../lib/measurement/selection/selection';
import {getNextId} from '../../../../util/database';
import {getUser} from '../../user/reducer';
import {getSelectedProject} from '../../project/reducer';

function getSelection(state: AppState, selectionId: string): Selection | null
{
    return selectionId === '' ? null : getSelectionById(getSelections(state), selectionId);
}

const addDataset = createRequestEpic(addLineChartDatasetAction, (action, state, deps) => {
    const {rangeFilter} = action.payload;
    return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), null, rangeFilter)
        .map(measurements => ({
            measurements,
            id: getNextId(state.session.views.lineChartPage.datasets),
            name: '',
            selectionId: '',
            yAxis: ''
        }));
});

const updateDataset = createRequestEpic(updateLineChartDatasetAction, (action, state, deps) => {
    const {selectionId, rangeFilter, dataset, yAxis} = action.payload;
    if (dataset.selectionId !== selectionId)
    {
        const selection = getSelection(state, selectionId);
        return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter)
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

const reloadDatasets = createRequestEpic(reloadLineChartDatasetsAction, (action, state, deps) => {
    const {rangeFilter} = action.payload;
    const datasets = state.session.views.lineChartPage.datasets;

    return datasets.length === 0 ? Observable.of([]) : Observable.forkJoin(datasets.map(dataset => {
        const selection = getSelection(state, dataset.selectionId);
        return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter)
            .map(measurements => ({
                ...dataset,
                measurements
            }));
    }));
});

export const lineChartEpics = combineEpics(
    addDataset,
    updateDataset,
    reloadDatasets
);
