import React, {PureComponent} from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {
    createProject, CreateProjectParams, loadProjects, selectProject
} from '../../state/project/actions';
import {getUser} from '../../state/user/reducer';
import {AppState} from '../../state/app/reducers';
import {getProjects} from '../../state/project/reducer';
import {Button} from 'reactstrap';
import {CreateProject} from './create-project';
import {Request} from '../../util/request';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import {push} from 'react-router-redux';
import {Navigation} from '../../state/nav/routes';
import styled from 'styled-components';

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
    push(path: string): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const ProjectLink = styled.span`
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

class ProjectsComponent extends PureComponent<Props, State>
{
    state: State = {
        creatingProject: false
    };

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State>
    {
        if (prevState.creatingProject &&
            !nextProps.createProjectRequest.loading &&
            !nextProps.createProjectRequest.error)
        {
            return {
                creatingProject: false
            };
        }

        return null;
    }

    componentDidMount()
    {
        this.props.loadProjects(this.props.user);
    }

    render()
    {
        const projects = this.props.projects;
        return (
            <div>
                <h2>Projects</h2>
                {this.props.loadProjectsRequest.error && <div>{this.props.loadProjectsRequest.error.toString()}</div>}
                {this.props.loadProjectsRequest.loading && <div>Loading...</div>}
                {this.props.createProjectRequest.error && <div>{this.props.createProjectRequest.error.toString()}</div>}
                {this.props.createProjectRequest.loading && <div>Creating project...</div>}
                <ListGroup>
                    {projects.map(project =>
                        <ListGroupItem key={project.id}>
                            <ProjectLink onClick={() => this.selectProject(project)}>
                                {project.name}
                            </ProjectLink>
                        </ListGroupItem>
                    )}
                </ListGroup>
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

    selectProject = (project: Project) =>
    {
        this.props.selectProject(project.name);
        this.props.push(Navigation.Overview);
    }
}

export const Projects = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    loadProjectsRequest: state.project.loadProjectsRequest,
    loadProjectRequest: state.project.loadProjectRequest,
    createProjectRequest: state.project.createProjectRequest,
    user: getUser(state),
    projects: getProjects(state)
}), {
    loadProjects: (user: User) => loadProjects.started({ user, force: true }),
    selectProject,
    createProject: createProject.started,
    push
})(ProjectsComponent));
