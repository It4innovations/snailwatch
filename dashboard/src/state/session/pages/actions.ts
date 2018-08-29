import actionCreatorFactory from 'typescript-fsa';
import {RangeFilter} from '../../../lib/view/range-filter';

const actionCreator = actionCreatorFactory('pages');

export const changeRangeFilterAction = actionCreator<RangeFilter>('changeRangeFilter');
