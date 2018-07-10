import React, {PureComponent} from 'react';
import {RouteComponentProps, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {
    createProject, CreateProjectParams, loadProjects, selectProject
} from '../../state/session/project/actions';
import {getUser} from '../../state/session/user/reducer';
import {AppState} from '../../state/app/reducers';
import {getProjects} from '../../state/session/project/reducer';
import {Button} from 'reactstrap';
import {CreateProject} from './create-project';
import {Request} from '../../util/request';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import styled from 'styled-components';
import {ErrorBox} from '../global/error-box';

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
                <ErrorBox error={this.props.loadProjectsRequest.error} />
                {this.props.loadProjectsRequest.loading && <div>Loading...</div>}
                <ErrorBox error={this.props.createProjectRequest.error} />
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
    }
}

export const Projects = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    loadProjectsRequest: state.session.project.loadProjectsRequest,
    loadProjectRequest: state.session.project.loadProjectRequest,
    createProjectRequest: state.session.project.createProjectRequest,
    user: getUser(state),
    projects: getProjects(state)
}), {
    loadProjects: (user: User) => loadProjects.started({ user, force: true }),
    selectProject: selectProject.started,
    createProject: createProject.started
})(ProjectsComponent));
