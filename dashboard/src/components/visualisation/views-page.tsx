import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {AppState} from '../../state/app/reducers';
import {createLoadMeasurementParams, LoadMeasurementParams, loadMeasurements} from '../../state/measurement/actions';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {getUser} from '../../state/user/reducer';
import {getSelectedProject} from '../../state/project/reducer';
import {Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import styled from 'styled-components';
import {LineChartPage} from './line-chart/line-chart-page';
import {BarChartPage} from './bar-chart/bar-chart-page';

interface StateProps
{
    user: User;
    project: Project;
}

interface DispatchProps
{
    loadMeasurements(params: LoadMeasurementParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    activeTab: number;
}

const TabLink = styled(NavLink)`
  cursor: pointer;
`;

class ViewsPageComponent extends PureComponent<Props, State>
{
    state: State = {
        activeTab: 0
    };

    componentDidMount()
    {
        this.props.loadMeasurements(createLoadMeasurementParams({
            user: this.props.user,
            project: this.props.project,
            filters: [],
            reload: true
        }));
    }

    render()
    {
        return (
            <>
                <Nav tabs>
                    {this.renderNav(0, 'Absolute')}
                    {this.renderNav(1, 'Bar chart')}
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId={0}>
                        <LineChartPage />
                    </TabPane>
                    <TabPane tabId={1}>
                        <BarChartPage />
                    </TabPane>
                </TabContent>
            </>
        );
    }
    renderNav = (index: number, text: string): JSX.Element =>
    {
        return (
            <NavItem>
                <TabLink
                    active={index === this.state.activeTab}
                    onClick={() => this.changeTab(index)}
                    title={text}>
                    {text}
                </TabLink>
            </NavItem>
        );
    }

    changeTab = (activeTab: number) =>
    {
        this.setState(() => ({ activeTab }));
    }
}

export const ViewsPage = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    project: getSelectedProject(state)
}), {
    loadMeasurements: loadMeasurements.started
})(ViewsPageComponent));
