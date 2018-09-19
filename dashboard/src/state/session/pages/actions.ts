import actionCreatorFactory from 'typescript-fsa';
import {Measurement} from '../../../lib/measurement/measurement';
import {RangeFilter} from '../../../lib/view/range-filter';

const actionCreator = actionCreatorFactory('pages');

export const changeRangeFilterAction = actionCreator<RangeFilter>('change-range-filter');
export const loadGlobalMeasurements = actionCreator.async<RangeFilter, Measurement[]>('load-global-measurements');
