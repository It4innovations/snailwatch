import React, {PureComponent} from 'react';
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {ProjectDetail} from './project';
import {User} from '../../lib/user/user';
import {createProject, CreateProjectParams, loadProjects} from '../../state/project/actions';
import {getUser} from '../../state/user/reducer';
import {AppState} from '../../state/app/reducers';
import {getProjects} from '../../state/project/reducer';
import {Link} from 'react-router-dom';
import {Navigation, projectRoute} from '../../state/nav/routes';
import {Button} from 'react-bootstrap';
import {CreateProject} from './create-project';
import {RequestContext} from '../../util/request';

interface State
{
    creatingProject: boolean;
}
interface StateProps
{
    user: User;
    projects: Project[];
    projectRequest: RequestContext;
}
interface DispatchProps
{
    loadProjects: (user: User) => void;
    createProject: (params: CreateProjectParams) => void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

class ProjectsComponent extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);
        this.state = {
            creatingProject: false
        };
    }

    componentDidMount()
    {
        this.props.loadProjects(this.props.user);
    }

    componentWillReceiveProps(props: Props)
    {
        if (this.state.creatingProject &&
            this.props.projectRequest.loading &&
            !props.projectRequest.loading &&
            !props.projectRequest.error)
        {
            this.setState(() => ({
                creatingProject: false
            }));
        }
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
                {this.props.projectRequest.error && <div>{this.props.projectRequest.error}</div>}
                {this.props.projectRequest.loading && <div>Loading...</div>}
                {projects.map(project =>
                    <div key={project.id}>
                        <Link to={projectRoute(project.name)}>
                            {project.name}
                        </Link>
                    </div>
                )}
                {this.state.creatingProject ? this.renderProjectCreation() :
                    <Button onClick={this.startProjectCreate}>Create project</Button>}
            </div>
        );
    }

    renderProjectCreation = (): JSX.Element =>
    {
        return <CreateProject onCreateRequest={this.createProject} />;
    }

    startProjectCreate = () =>
    {
        this.setState(() => ({
            creatingProject: true
        }));
    }
    createProject = (name: string) =>
    {
        this.props.createProject({
            user: this.props.user,
            name
        });
    }
}

export const Projects = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    projectRequest: state.project.projectRequest,
    user: getUser(state),
    projects: getProjects(state)
}), {
    loadProjects: (user: User) => loadProjects.started({ user, force: false }),
    createProject: createProject.started
})(ProjectsComponent));
