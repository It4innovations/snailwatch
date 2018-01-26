import actionCreatorFactory from 'typescript-fsa';
import {User} from '../../lib/user/user';
import {Project} from '../../lib/project/project';
import {Benchmark} from '../../lib/benchmark/benchmark';

const actionCreator = actionCreatorFactory('benchmark');

export const loadBenchmarks = actionCreator.async<{
    user: User,
    project: Project
}, Benchmark[]>('load');
