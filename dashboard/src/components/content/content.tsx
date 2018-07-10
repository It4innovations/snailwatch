import React, {PureComponent} from 'react';
import {Projects} from '../projects/projects';
import {Login} from '../login/login';
import {Navigation, Routes} from '../../state/nav/routes';
import {Redirect, RouteComponentProps, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {AppState} from '../../state/app/reducers';
import {isUserAuthenticated} from '../../state/session/user/reducer';
import {Menu} from './menu';
import {SwitchRoute} from '../../state/nav/switch-route';
import styled from 'styled-components';
import {Profile} from '../profile/profile';
import {Project} from '../../lib/project/project';
import {getSelectedProject} from '../../state/session/project/reducer';
import {MeasurementList} from '../visualisation/measurements/measurement-list';
import {ViewsPage} from '../visualisation/views-page';
import {ProjectOverview} from '../project/project-overview';
import {clearSession} from '../../state/session/actions';
import {deselectProject} from '../../state/session/project/actions';

import './global.scss';

interface StateProps
{
    authenticated: boolean;
    selectedProject: Project | null;
}
interface DispatchProps
{
    clearSession(): void;
    deselectProject(): void;
}

const Wrapper = styled.div`
  width: 100%;
  margin: 0;
  padding: 5px;
`;
const Body = styled.div`
  margin: 10px;
`;

class ContentComponent extends PureComponent<StateProps & DispatchProps & RouteComponentProps<void>>
{
    render()
    {
        return (
            <Wrapper>
                <Menu authenticated={this.props.authenticated}
                      selectedProject={this.props.selectedProject}
                      deselectProject={this.props.deselectProject} />
                <Body>
                    <Switch>
                        <SwitchRoute path={Routes.Login} component={Login}
                                     usePrimaryRoute={!this.props.authenticated} redirect={Navigation.Projects} />
                        {this.authRoute(Routes.Profile, Profile)}
                        {this.isProjectSelected() && this.authRoute(Routes.Overview, ProjectOverview)}
                        {this.isProjectSelected() && this.authRoute(Routes.MeasurementList, MeasurementList)}
                        {this.isProjectSelected() && this.authRoute(Routes.Views, ViewsPage)}
                        {this.authRoute(Routes.Projects, Projects)}
                        {this.authRoute(Routes.Logout, this.logoutUser)}
                        {this.getAuthenticatedFallback()}
                        {!this.props.authenticated && <Redirect to={Navigation.Login} />}
                    </Switch>
                </Body>
            </Wrapper>
        );
    }

    getAuthenticatedFallback = (): JSX.Element =>
    {
        if (this.props.authenticated)
        {
            if (this.isProjectSelected())
            {
                return <Redirect to={Navigation.Overview} />;
            }
            else return <Redirect to={Navigation.Projects} />;
        }

        return null;
    }

    authRoute = <T extends {}>(path: string, component: React.ComponentType<T>): JSX.Element =>
    {
        return <SwitchRoute path={path} component={component}
                     usePrimaryRoute={this.props.authenticated} redirect={Navigation.Login} />;
    }

    logoutUser = (): JSX.Element =>
    {
        this.props.clearSession();
        return <Redirect to={Navigation.Login} />;
    }

    isProjectSelected = (): boolean =>
    {
        return this.props.selectedProject !== null;
    }
}

export const Content = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    authenticated: isUserAuthenticated(state),
    selectedProject: getSelectedProject(state)
}), {
    clearSession,
    deselectProject
})(ContentComponent));
