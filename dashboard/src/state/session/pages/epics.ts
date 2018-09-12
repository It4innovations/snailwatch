import {combineEpics} from 'redux-observable';
import {createRequestEpic} from '../../../util/request';
import {getSelectedProject} from '../project/reducer';
import {getUser} from '../user/reducer';
import {loadGlobalMeasurements} from './actions';

const loadMeasurements = createRequestEpic(loadGlobalMeasurements, (action, state, deps) => {
    const user = getUser(state);
    const project = getSelectedProject(state);

    return deps.client.loadMeasurements(user, project, null, action.payload);
});

export const pageEpics = combineEpics(
    loadMeasurements
);
