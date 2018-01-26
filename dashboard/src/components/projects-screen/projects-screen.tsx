import React, {PureComponent} from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {loadProjects} from '../../state/project/actions';
import {getUser} from '../../state/user/reducer';
import {AppState} from '../../state/app/reducers';
import {getProjects} from '../../state/project/reducer';

interface StateProps
{
    user: User;
    projects: Project[];
}
interface DispatchProps
{
    loadProjects: (user: User) => void;
}

type Props = StateProps & DispatchProps;

class ProjectsScreenComponent extends PureComponent<Props & RouteComponentProps<string>>
{
    componentDidMount()
    {
        this.props.loadProjects(this.props.user);
    }

    render()
    {
        const projects = this.props.projects || [];
        return (
            <div>
                <Link to={'/asd'}>test</Link>
                {projects.map(project =>
                    <div key={project.id}>{project.name}</div>
                )}
            </div>
        );
    }
}

export const ProjectsScreen = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    projects: getProjects(state)
}), {
    loadProjects: loadProjects.started
})(ProjectsScreenComponent));
