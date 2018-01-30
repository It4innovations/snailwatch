import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';
import {Measurement} from '../../lib/measurement/measurement';

const actionCreator = actionCreatorFactory('measurement');

export const loadMeasurements = actionCreator.async<{
    user: User,
    project: Project
}, Measurement[]>('load');
