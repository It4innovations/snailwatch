import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {getUser} from '../../state/user/reducer';
import {Route, RouteComponentProps, Switch, withRouter} from 'react-router';
import {Tab, Tabs} from 'react-bootstrap';
import {push} from 'react-router-redux';
import {MeasurementList} from './measurement-list/measurement-list';
import {clearMeasurements} from '../../state/measurement/actions';
import {Measurement} from '../../lib/measurement/measurement';
import {getMeasurements} from '../../state/measurement/reducer';
import {Visualisation} from './visualisation/visualisation';
import {Request} from '../../util/request';
import {getSelectedProject} from '../../state/project/reducer';
import {selectProject} from '../../state/project/actions';

interface StateProps
{
    user: User;
    project: Project;
    measurements: Measurement[];
    loadProjectRequest: Request;
}
interface DispatchProps
{
    push(path: string): void;
    selectProject(name: string): void;
    clearMeasurements(): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const TAB_ROUTES = {
    measurements: 'measurements',
    visualisation: 'visualisation'
};

class ProjectComponent extends PureComponent<Props & RouteComponentProps<{name: string}>>
{
    componentWillMount()
    {
        const {name} = this.props.match.params;
        if (this.props.project === null)
        {
            this.props.selectProject(name);
        }
    }

    componentWillUnmount()
    {
        this.props.clearMeasurements();
    }

    render()
    {
        if (this.props.loadProjectRequest.error)
        {
            return <div>{this.props.loadProjectRequest.error}</div>;
        }

        if (this.props.project === null || this.props.loadProjectRequest.loading)
        {
            return <div>Loading project {this.props.match.params.name}</div>;
        }

        const {match} = this.props;
        return (
            <Switch>
                {this.tabRoute(match.url, TAB_ROUTES.measurements)}
                {this.tabRoute(match.url, TAB_ROUTES.visualisation)}
                <Route render={() => this.renderTabs(TAB_ROUTES.measurements)} />
            </Switch>
        );
    }

    tabRoute = (url: string, path: string): JSX.Element =>
    {
        return <Route path={`${url}/${path}`} render={() => this.renderTabs(path)} />;
    }

    renderTabs = (path: string): JSX.Element =>
    {
        return (
            <Tabs activeKey={path} id='project-view-menu'
                  onSelect={this.selectTab}
                  animation={false}>
                <Tab eventKey='measurements'
                     title='Measurements'>
                    <MeasurementList />
                </Tab>
                <Tab eventKey='visualisation'
                     title='Visualisation'>
                    <Visualisation
                        user={this.props.user}
                        project={this.props.project}
                        measurements={this.props.measurements} />
                </Tab>
            </Tabs>
        );
    }

    selectTab = (key: React.SyntheticEvent<{}>) =>
    {
        this.props.push(`${this.props.match.url}/${key}`);
    }
}

export const ProjectDetail = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state),
    measurements: getMeasurements(state),
    loadProjectRequest: state.project.loadProjectRequest
}), {
    push,
    selectProject,
    clearMeasurements
})(ProjectComponent));
