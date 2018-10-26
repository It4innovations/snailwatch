import {PersistedState} from 'redux-persist/es/types';
import {SortMode} from '../../components/charts/chart/sort-mode';
import {XAxisSettings} from '../../components/charts/chart/x-axis-settings';
import {SessionState} from '../session/reducers';
import {lensPath, over} from 'ramda';

type SavedState = PersistedState & SessionState;

export const migrations = {
    0: (state: SavedState) => state,
    1: (state: SavedState) => over(lensPath(['pages', 'chartState', 'xAxisSettings']), (settings: XAxisSettings) => ({
        ...settings,
        sortMode: SortMode.Timestamp
    }), state)
};
