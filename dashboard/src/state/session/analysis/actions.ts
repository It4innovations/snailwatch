import {createCrudActions} from '../../../util/crud';
import {Analysis} from '../../../lib/analysis/analysis';

export const AnalysisActions = createCrudActions<Analysis>('analysis');
