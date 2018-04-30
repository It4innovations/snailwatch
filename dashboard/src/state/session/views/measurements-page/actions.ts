import actionCreatorFactory from 'typescript-fsa';
import {Measurement} from '../../../../lib/measurement/measurement';

const actionCreator = actionCreatorFactory('measurements-page');

export const loadMeasurementsAction = actionCreator.async<{}, Measurement[]>('load');
export const deleteMeasurementAction = actionCreator.async<Measurement, boolean>('delete');
export const setMeasurementsSelectionAction = actionCreator<string>('set-selection');