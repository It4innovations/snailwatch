import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {Benchmark} from '../../lib/benchmark/benchmark';
import {AppState} from '../../state/app/reducers';
import {getBenchmarks} from '../../state/benchmark/reducer';
import {loadBenchmarks} from '../../state/benchmark/actions';
import {bindActionCreators} from 'redux';
import {getUser} from '../../state/user/reducer';

interface OwnProps
{
    project: Project;
}
interface StateProps
{
    user: User;
    benchmarks: Benchmark[];
}
interface DispatchProps
{
    loadBenchmarks(user: User): void;
}

type Props = OwnProps & StateProps & DispatchProps;

class ProjectComponent extends PureComponent<Props>
{
    componentDidMount()
    {
        this.props.loadBenchmarks(this.props.user);
    }

    render()
    {
        return (
            <div>
                <h3>Project {this.props.project.name}</h3>
                <h4>Benchmarks</h4>
                {this.props.benchmarks.map(benchmark =>
                    <div>
                        {benchmark.name}
                    </div>
                )}
            </div>
        );
    }
}

export const ProjectDetail = connect<StateProps, DispatchProps, {}>((state: AppState, props: OwnProps) => ({
    user: getUser(state),
    benchmarks: getBenchmarks(state, props.project)
}), (dispatch, props: OwnProps) => bindActionCreators({
        loadBenchmarks: (user: User) => loadBenchmarks.started({
            user: user,
            project: props.project
        })
    },
    dispatch)
)(ProjectComponent);
