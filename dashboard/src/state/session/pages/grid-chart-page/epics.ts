import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../../util/request';
import {getSelectedProject} from '../../project/reducer';
import {getUser} from '../../user/reducer';
import {getRangeFilter} from '../reducers';
import {loadGridChartMeasurements} from './actions';

const loadMeasurements = createRequestEpic(loadGridChartMeasurements, (action, state, deps) => {
    const user = getUser(state);
    const project = getSelectedProject(state);
    const rangeFilter = getRangeFilter(state);

    return deps.client.loadMeasurements(user, project, null, rangeFilter);
});

export const gridChartPageEpics = combineEpics(loadMeasurements);
