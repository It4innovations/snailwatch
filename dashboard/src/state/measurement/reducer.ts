import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {Request, requestDone, requestErrored, requestStarted} from '../../util/request';
import {Project} from '../../lib/project/project';
import {AppState} from '../app/reducers';
import {Measurement} from '../../lib/measurement/measurement';
import {loadMeasurements} from './actions';

export interface MeasurementState
{
    measurements: {[key: string]: Measurement[]};
    measurementRequest: Request;
}

const reducer = reducerWithInitialState<MeasurementState>({
    measurements: {},
    measurementRequest: requestDone()
})
.case(loadMeasurements.started, state => ({
    ...state,
    measurementRequest: requestStarted()
}))
.case(loadMeasurements.failed, (state, response) => ({
    ...state,
    measurementRequest: requestErrored(response.error)
}))
.case(loadMeasurements.done, (state, response) => ({
    ...state,
    measurementRequest: requestDone(),
    measurements: {
        ...state.measurements,
        [response.params.project.id]: response.result
    }
}));

export function getMeasurements(state: AppState, project: Project): Measurement[]
{
    const measurements = state.measurement.measurements;
    if (measurements.hasOwnProperty(project.id))
    {
        return measurements[project.id];
    }
    else return [];
}

export const measurementReducer = reducer;
