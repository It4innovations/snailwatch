import {combineEpics} from 'redux-observable';
import '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {loadBarChartMeasurementsAction} from './actions';

const loadMeasurementsEpics = createRequestEpic(loadBarChartMeasurementsAction, (action, state, deps) => {
    const {user, project, selection, rangeFilter} = action.payload;
    return deps.client.loadMeasurements(user, project, selection, rangeFilter);
});

export const barChartEpics = combineEpics(
    loadMeasurementsEpics
);
