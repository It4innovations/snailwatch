import actionCreatorFactory from 'typescript-fsa';
import {Selection} from '../../../lib/measurement/selection/selection';

const actionCreator = actionCreatorFactory('selection');

export const loadSelectionsAction = actionCreator.async<{}, Selection[]>('load');
export const createSelectionAction = actionCreator.async<Selection, Selection>('create');
export const updateSelectionAction = actionCreator.async<Selection, boolean>('update');
export const deleteSelectionAction = actionCreator.async<Selection, boolean>('delete');
