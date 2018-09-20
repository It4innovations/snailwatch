import {combineEpics} from 'redux-observable';
import {map} from 'rxjs/operators';
import {ofAction} from '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {AppEpic} from '../../../app/app-epic';
import {getSelectedProject} from '../../project/reducer';
import {getToken} from '../../user/reducer';
import {changeRangeFilterAction} from '../actions';
import {getRangeFilter} from '../reducers';
import {loadGridChartMeasurements} from './actions';

const loadMeasurements = createRequestEpic(loadGridChartMeasurements, (action, state, deps) => {
    const project = getSelectedProject(state);
    const rangeFilter = getRangeFilter(state);

    return deps.client.loadMeasurements(getToken(state), project, null, rangeFilter);
});

const loadMeasurementsAfterRangeFilterChange: AppEpic = action$ =>
    action$.pipe(
        ofAction(changeRangeFilterAction),
        map(() => loadGridChartMeasurements.started)
    );

export const gridChartPageEpics = combineEpics(
    loadMeasurements,
    loadMeasurementsAfterRangeFilterChange
);
