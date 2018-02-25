import React, {PureComponent} from 'react';
import {Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {ProjectDetail} from '../project/project';
import {User} from '../../lib/user/user';
import {
    createProject, CreateProjectParams, loadProjects, selectProject
} from '../../state/project/actions';
import {getUser} from '../../state/user/reducer';
import {AppState} from '../../state/app/reducers';
import {getProjects} from '../../state/project/reducer';
import {Link} from 'react-router-dom';
import {projectRoute} from '../../state/nav/routes';
import {Button} from 'reactstrap';
import {CreateProject} from './create-project';
import {Request} from '../../util/request';

interface State
{
    creatingProject: boolean;
}
interface StateProps
{
    user: User;
    projects: Project[];
    loadProjectsRequest: Request;
    createProjectRequest: Request;
    loadProjectRequest: Request;
}
interface DispatchProps
{
    loadProjects(user: User): void;
    selectProject(name: string): void;
    createProject(params: CreateProjectParams): void;
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
            this.props.createProjectRequest.loading &&
            !props.createProjectRequest.loading &&
            !props.createProjectRequest.error)
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
                <Route path={`${match.url}/:name`} render={() => <ProjectDetail />} />
                <Route exact path={match.url} render={() => this.renderProjects()} />
            </Switch>
        );
    }

    renderProjects = (): JSX.Element =>
    {
        const projects = this.props.projects;
        return (
            <div>
                <h2>Projects</h2>
                {this.props.loadProjectsRequest.error && <div>{this.props.loadProjectsRequest.error.toString()}</div>}
                {this.props.loadProjectsRequest.loading && <div>Loading...</div>}
                {this.props.createProjectRequest.error && <div>{this.props.createProjectRequest.error.toString()}</div>}
                {this.props.createProjectRequest.loading && <div>Creating project...</div>}
                {projects.map(project =>
                    <div key={project.id}>
                        <Link to={projectRoute(project.name)}>
                            {project.name}
                        </Link>
                    </div>
                )}
                {this.state.creatingProject ? this.renderProjectCreation() :
                    <Button
                        onClick={this.startProjectCreate}
                        color='success'>Create project</Button>}
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
    loadProjectsRequest: state.project.loadProjectsRequest,
    loadProjectRequest: state.project.loadProjectRequest,
    createProjectRequest: state.project.createProjectRequest,
    user: getUser(state),
    projects: getProjects(state)
}), {
    loadProjects: (user: User) => loadProjects.started({ user, force: false }),
    selectProject,
    createProject: createProject.started
})(ProjectsComponent));
