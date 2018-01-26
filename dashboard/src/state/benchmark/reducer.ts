import {reducerWithInitialState} from 'typescript-fsa-reducers';
import {loadBenchmarks} from './actions';
import {RequestContext, requestDone, requestErrored, requestStarted} from '../../util/request';
import {Benchmark} from '../../lib/benchmark/benchmark';
import {Project} from '../../lib/project/project';
import {AppState} from '../app/reducers';

export interface BenchmarkState
{
    benchmarks: {[key: string]: Benchmark[]};
    benchmarkRequest: RequestContext;
}

const reducer = reducerWithInitialState<BenchmarkState>({
    benchmarks: {},
    benchmarkRequest: requestDone()
})
.case(loadBenchmarks.started, state => ({
    ...state,
    benchmarkRequest: requestStarted()
}))
.case(loadBenchmarks.failed, (state, response) => ({
    ...state,
    benchmarkRequest: requestErrored(response.error)
}))
.case(loadBenchmarks.done, (state, response) => ({
    ...state,
    benchmarkRequest: requestDone(),
    benchmarks: {
        ...state.benchmarks,
        [response.params.project.id]: response.result
    }
}));

export function getBenchmarks(state: AppState, project: Project): Benchmark[]
{
    const benchmarks = state.benchmark.benchmarks;
    if (benchmarks.hasOwnProperty(project.id))
    {
        return benchmarks[project.id];
    }
    else return [];
}

export const benchmarkReducer = reducer;
