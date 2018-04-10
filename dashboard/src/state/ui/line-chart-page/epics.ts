import {combineEpics} from 'redux-observable';
import '../../../util/redux-observable';
import 'rxjs/add/observable/of';
import {createRequestEpic} from '../../../util/request';
import {addLineChartDatasetAction, updateLineChartDatasetAction} from './actions';
import {Observable} from 'rxjs/Observable';

const loadInitialMeasurements = createRequestEpic(addLineChartDatasetAction, (action, state, deps) => {
    const {user, project, rangeFilter} = action.payload;
    return deps.client.loadMeasurements(user, project, null, rangeFilter)
        .map(measurements => ({
            measurements,
            selection: null,
            yAxis: ''
        }));
});

const loadMeasurementAfterUpdate = createRequestEpic(updateLineChartDatasetAction, (action, state, deps) => {
    const {user, project, selection, rangeFilter, dataset, yAxis} = action.payload;
    if (dataset.selection !== selection)
    {
        return deps.client.loadMeasurements(user, project, selection, rangeFilter)
            .map(measurements => ({
                    ...dataset,
                    selection,
                    measurements,
                    yAxis
            }));
    }
    else return Observable.of({
        ...dataset,
        yAxis
    });
});

export const lineChartEpics = combineEpics(
    loadInitialMeasurements,
    loadMeasurementAfterUpdate
);
