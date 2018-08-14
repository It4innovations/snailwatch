import actionCreatorFactory from 'typescript-fsa';
import {Measurement} from '../../../../lib/measurement/measurement';

const actionCreator = actionCreatorFactory('grid-chart-page');

export const loadGridChartMeasurements = actionCreator.async<{}, Measurement[]>('load');
