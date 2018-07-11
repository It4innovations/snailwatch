import actionCreatorFactory from 'typescript-fsa';
import {Analysis} from '../../../lib/analysis/analysis';

const actionCreator = actionCreatorFactory('analysis');

export const loadAnalysesAction = actionCreator.async<{}, Analysis[]>('load');
export const createAnalysisAction = actionCreator.async<Analysis, Analysis>('create');
export const updateAnalysisAction = actionCreator.async<Analysis, boolean>('update');
export const deleteAnalysisAction = actionCreator.async<Analysis, boolean>('delete');
