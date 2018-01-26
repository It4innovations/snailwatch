import React, {PureComponent} from 'react';
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {ProjectDetail} from './project';
import {User} from '../../lib/user/user';
import {loadProjects} from '../../state/project/actions';
import {getUser} from '../../state/user/reducer';
import {AppState} from '../../state/app/reducers';
import {getProjects} from '../../state/project/reducer';
import {Link} from 'react-router-dom';
import {Navigation, projectRoute} from '../../state/nav/routes';

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

class ProjectsComponent extends PureComponent<Props & RouteComponentProps<void>>
{
    componentDidMount()
    {
        this.props.loadProjects(this.props.user);
    }

    render()
    {
        const match = this.props.match;
        return (
            <Switch>
                <Route path={`${match.url}/:name`} render={this.renderProject} />
                <Route exact path={match.url} render={this.renderProjects} />
            </Switch>
        );
    }

    renderProject = (props: RouteComponentProps<{name: string}>): JSX.Element =>
    {
        const name = props.match.params.name;
        const project = this.props.projects.find(p => p.name === name);
        if (project === undefined)
        {
            return <Redirect to={Navigation.Projects} />;
        }

        return <ProjectDetail project={project} />;
    }

    renderProjects = (): JSX.Element =>
    {
        const projects = this.props.projects;
        return (
            <div>
                <h2>Projects</h2>
                {projects.map(project =>
                    <Link key={project.id} to={projectRoute(project.name)}>{project.name}</Link>
                )}
            </div>
        );
    }
}

export const Projects = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    projects: getProjects(state)
}), {
    loadProjects: loadProjects.started
})(ProjectsComponent));
