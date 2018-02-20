import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {getUser} from '../../state/user/reducer';
import {Route, RouteComponentProps, withRouter} from 'react-router';
import {Tab, Tabs} from 'react-bootstrap';
import {push} from 'react-router-redux';
import {MeasurementList} from './measurement-list/measurement-list';
import {clearMeasurements} from '../../state/measurement/actions';
import {Measurement} from '../../lib/measurement/measurement';
import {getMeasurements} from '../../state/measurement/reducer';
import {Request} from '../../util/request';
import {getSelectedProject} from '../../state/project/reducer';
import {selectProject} from '../../state/project/actions';
import {ChartsPage} from './visualisation/charts-page';

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
    charts: 'charts'
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

        const match = this.props.match;
        return (
            <Route path={`${match.url}/:tab?`} render={this.renderTabs} />
        );
    }

    renderTabs = (path: RouteComponentProps<{tab: string}>): JSX.Element =>
    {
        return (
            <Tabs activeKey={path.match.params.tab || TAB_ROUTES.measurements} id='project-view-menu'
                  onSelect={this.selectTab}
                  animation={false}
                  mountOnEnter={true}
                  unmountOnExit={true}>
                <Tab eventKey='measurements'
                     title='Measurements'>
                    <MeasurementList />
                </Tab>
                <Tab eventKey='charts'
                     title='Charts'>
                    <ChartsPage />
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
