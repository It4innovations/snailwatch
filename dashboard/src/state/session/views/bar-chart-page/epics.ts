import {combineEpics} from 'redux-observable';
import '../../../../util/redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {loadBarChartMeasurementsAction} from './actions';
import {getUser} from '../../user/reducer';
import {getSelectedProject} from '../../project/reducer';

const loadMeasurementsEpics = createRequestEpic(loadBarChartMeasurementsAction, (action, state, deps) => {
    const {selection, rangeFilter} = action.payload;
    return deps.client.loadMeasurements(getUser(state), getSelectedProject(state), selection, rangeFilter);
});

export const barChartEpics = combineEpics(
    loadMeasurementsEpics
);
