import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {getUser} from '../../state/user/reducer';

interface OwnProps
{
    project: Project;
}
interface StateProps
{
    user: User;
}
interface DispatchProps
{

}

type Props = OwnProps & StateProps & DispatchProps;

class ProjectComponent extends PureComponent<Props>
{
    componentDidMount()
    {

    }

    render()
    {
        return (
            <div>
                <h3>Project {this.props.project.name}</h3>
            </div>
        );
    }
}

export const ProjectDetail = connect<StateProps, DispatchProps, {}>((state: AppState) => ({
    user: getUser(state)
}), {

}
)(ProjectComponent);
