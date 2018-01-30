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
import {clearMeasurements, LoadMeasurementParams, loadMeasurements} from '../../state/measurement/actions';
import {Measurement} from '../../lib/measurement/measurement';
import {getMeasurements} from '../../state/measurement/reducer';

interface OwnProps
{
    project: Project;
}
interface StateProps
{
    user: User;
    measurements: Measurement[];
}
interface DispatchProps
{
    push(path: string): void;
    loadMeasurements(params: LoadMeasurementParams): void;
    clearMeasurements(): void;
}

type Props = OwnProps & StateProps & DispatchProps & RouteComponentProps<void>;

const TAB_ROUTES = {
    measurements: 'measurements',
    visualisation: 'visualisation'
};

class ProjectComponent extends PureComponent<Props>
{
    componentDidMount()
    {
        this.props.loadMeasurements({
            user: this.props.user,
            project: this.props.project
        });
    }

    componentWillUnmount()
    {
        this.props.clearMeasurements();
    }

    render()
    {
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
                    <MeasurementList
                        user={this.props.user}
                        project={this.props.project}
                        measurements={this.props.measurements} />
                </Tab>
                <Tab eventKey='visualisation'
                     title='Visualisation'>
                    visualisation
                </Tab>
            </Tabs>
        );
    }

    selectTab = (key: React.SyntheticEvent<{}>) =>
    {
        this.props.push(`${this.props.match.url}/${key}`);
    }
}

export const ProjectDetail = withRouter(connect<StateProps, DispatchProps, {}>((state: AppState) => ({
    user: getUser(state),
    measurements: getMeasurements(state)
}), {
    push,
    loadMeasurements: loadMeasurements.started,
    clearMeasurements
}
)(ProjectComponent));
