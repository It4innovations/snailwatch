import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../util/request';
import {getSelectedProject} from '../project/reducers';
import {getToken} from '../user/reducers';
import {loadGlobalMeasurements} from './actions';

const loadMeasurements = createRequestEpic(loadGlobalMeasurements, (action, store, deps) =>
    deps.client.loadMeasurements(getToken(store.value), getSelectedProject(store.value), null, action.payload)
);

export const pageEpics = combineEpics(
    loadMeasurements
);
