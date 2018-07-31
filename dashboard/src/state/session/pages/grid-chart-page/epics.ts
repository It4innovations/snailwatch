import {combineEpics} from 'redux-observable';
import '../../../../util/redux-observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/forkJoin';
import {createRequestEpic} from '../../../../util/request';
import {Observable} from 'rxjs/Observable';
import {loadGridChartDatasetsAction} from './actions';
import {getUser} from '../../user/reducer';
import {getSelectedProject} from '../../project/reducer';
import {getSelections} from '../../selection/reducer';
import {getRangeFilter} from '../reducers';

const loadDatasets = createRequestEpic(loadGridChartDatasetsAction, (action, state, deps) => {
    const user = getUser(state);
    const project = getSelectedProject(state);
    const selections = getSelections(state);
    const rangeFilter = getRangeFilter(state);

    return selections.length === 0 ? Observable.of([]) : Observable.forkJoin(selections.map((selection, index) => {
        return deps.client.loadMeasurements(user, project, selection, rangeFilter)
            .map(measurements => ({
                id: index.toString(),
                selectionId: selection.id,
                yAxis: '',
                measurements
            }));
    }));
});

export const gridChartEpics = combineEpics(
    loadDatasets
);
