import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Button} from 'reactstrap';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import styled from 'styled-components';
import {Project} from '../../lib/project/project';
import {AppState} from '../../state/app/reducers';
import {createProject, loadProjects, selectProject} from '../../state/session/project/actions';
import {getProjects} from '../../state/session/project/reducer';
import {getUser} from '../../state/session/user/reducer';
import {Request} from '../../util/request';
import {ErrorBox} from '../global/error-box';
import {Loading} from '../global/loading';
import {CreateProject} from './create-project';

interface State
{
    creatingProject: boolean;
}
interface StateProps
{
    projects: Project[];
    loadProjectsRequest: Request;
    createProjectRequest: Request;
    loadProjectRequest: Request;
}
interface DispatchProps
{
    loadProjects(): void;
    selectProject(name: string): void;
    createProject(name: string): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const Header = styled.div`
  display: flex;
  align-items: center;
`;
const Title = styled.h2`
  margin-right: 10px;
`;
const ProjectList = styled(ListGroup)`
  width: 400px;
  margin-bottom: 10px !important;
`;
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
        this.props.loadProjects();
    }

    render()
    {
        const projects = this.props.projects;
        return (
            <div>
                <Header>
                    <Title>Projects</Title>
                    <Loading show={this.props.loadProjectsRequest.loading || this.props.createProjectRequest.loading} />
                </Header>
                <ErrorBox error={this.props.loadProjectsRequest.error} />
                <ErrorBox error={this.props.createProjectRequest.error} />
                <ProjectList>
                    {projects.map(project =>
                        <ListGroupItem key={project.id}>
                            <ProjectLink onClick={() => this.selectProject(project)}>
                                {project.name}
                            </ProjectLink>
                        </ListGroupItem>
                    )}
                </ProjectList>
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
        this.props.createProject(name);
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
    loadProjects: () => loadProjects.started({ force: true }),
    selectProject: selectProject.started,
    createProject: createProject.started
})(ProjectsComponent));
