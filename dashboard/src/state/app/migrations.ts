import {PersistedState} from 'redux-persist/es/types';
import {SessionState} from '../session/reducers';

type SavedState = PersistedState & SessionState;

export const migrations = {
    0: (state: SavedState) => state
};
