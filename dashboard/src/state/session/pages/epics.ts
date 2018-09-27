import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../util/request';
import {getSelectedProject} from '../project/reducers';
import {getToken} from '../user/reducers';
import {loadGlobalMeasurements} from './actions';

const loadMeasurements = createRequestEpic(loadGlobalMeasurements, (action, state, deps) =>
    deps.client.loadMeasurements(getToken(state), getSelectedProject(state), null, action.payload)
);

export const pageEpics = combineEpics(
    loadMeasurements
);
