import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Button} from 'reactstrap';
import ListGroup from 'reactstrap/lib/ListGroup';
import ListGroupItem from 'reactstrap/lib/ListGroupItem';
import styled from 'styled-components';
import {createProject, Project} from '../../lib/project/project';
import {AppState} from '../../state/app/reducers';
import {ProjectActions, selectProject} from '../../state/session/project/actions';
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
    projectRequest: Request;
}
interface DispatchProps
{
    selectProject(name: string): void;
    createProject(project: Project): void;
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

    componentDidUpdate(prevProps: Props)
    {
        if (this.state.creatingProject &&
            !this.props.projectRequest.loading &&
            !this.props.projectRequest.error &&
            this.props.projects !== prevProps.projects)
        {
            this.setState({ creatingProject: false });
        }
    }

    render()
    {
        const projects = this.props.projects;
        return (
            <div>
                <Header>
                    <Title>Projects</Title>
                    <Loading show={this.props.projectRequest.loading} />
                </Header>
                <ErrorBox error={this.props.projectRequest.error} />
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
        this.setState({ creatingProject: true });
    }
    createProject = (name: string) =>
    {
        this.props.createProject(createProject({ name }));
    }

    selectProject = (project: Project) =>
    {
        this.props.selectProject(project.name);
    }
}

export const Projects = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    projectRequest: state.session.project.projectRequest,
    user: getUser(state),
    projects: getProjects(state)
}), {
    selectProject: selectProject.started,
    createProject: ProjectActions.create.started
})(ProjectsComponent));
