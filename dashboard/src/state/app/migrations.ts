import {lensPath, over} from 'ramda';
import {PersistedState} from 'redux-persist/es/types';
import {Measurement} from '../../lib/measurement/measurement';
import {createRequest} from '../../util/request';
import {SessionState} from '../session/reducers';

type SavedState = PersistedState & SessionState;

export const migrations = {
    0: (state: SavedState) => state,
    1: (state: SavedState) => over(lensPath(['pages', 'global']), (global: {}) => ({
        ...global,
        measurements: [] as Measurement[],
        measurementsRequest: createRequest()
    }), state),
    2: (state: SavedState) => over(lensPath(['user']), (global: {user: {token: string}}) => ({
        ...global,
        user: global.user,
        token: global.user !== null ? global.user.token : null,
    }), state)
};
