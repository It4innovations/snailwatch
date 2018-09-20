import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../util/request';
import {getSelectedProject} from '../project/reducer';
import {getToken} from '../user/reducer';
import {loadGlobalMeasurements} from './actions';

const loadMeasurements = createRequestEpic(loadGlobalMeasurements, (action, state, deps) => {
    return deps.client.loadMeasurements(getToken(state), getSelectedProject(state), null, action.payload);
});

export const pageEpics = combineEpics(
    loadMeasurements
);
