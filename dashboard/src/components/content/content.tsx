import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {Redirect, RouteComponentProps, Switch, withRouter} from 'react-router';
import styled from 'styled-components';
import {Project} from '../../lib/project/project';
import {initAppAction} from '../../state/app/actions';
import {AppState} from '../../state/app/reducers';
import {Navigation, Routes} from '../../state/nav/routes';
import {SwitchRoute} from '../../state/nav/switch-route';
import {clearSession} from '../../state/session/actions';
import {deselectProject} from '../../state/session/project/actions';
import {getSelectedProject} from '../../state/session/project/reducers';
import {isUserAuthenticated} from '../../state/session/user/reducers';
import {ChartsPage} from '../charts/charts-page';
import {Login} from '../login/login';
import {MeasurementList} from '../measurement-list/measurement-list';
import {Profile} from '../profile/profile';
import {ProjectOverview} from '../project/project-overview';
import {Projects} from '../projects/projects';
import './global.scss';
import {Menu} from './menu';

interface StateProps
{
    authenticated: boolean;
    selectedProject: Project | null;
}
interface DispatchProps
{
    initApp(): void;
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
    componentDidMount()
    {
        this.props.initApp();
    }

    render()
    {
        return (
            <Wrapper>
                <Menu authenticated={this.props.authenticated}
                      selectedProject={this.props.selectedProject}
                      deselectProject={this.props.deselectProject} />
                <Body>
                    <Switch>
                        <SwitchRoute path={Routes.Login}
                                     component={Login}
                                     usePrimaryRoute={!this.props.authenticated}
                                     redirect={Navigation.Projects} />
                        {this.authRoute(Routes.Profile, Profile)}
                        {this.authRoute(Routes.Overview, ProjectOverview, true)}
                        {this.authRoute(Routes.MeasurementList, MeasurementList, true)}
                        {this.authRoute(Routes.Dashboard, ChartsPage, true)}
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
                return <Redirect to={Navigation.Dashboard} />;
            }
            else return <Redirect to={Navigation.Projects} />;
        }

        return null;
    }

    authRoute = <T extends {}>(path: string, component: React.ComponentType<T>, requiresProject: boolean = false)
        : JSX.Element =>
    {
        if (requiresProject && !this.isProjectSelected()) return null;

        return <SwitchRoute path={path}
                            component={component}
                            usePrimaryRoute={this.props.authenticated}
                            redirect={Navigation.Login} />;
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
    initApp: initAppAction,
    clearSession,
    deselectProject
})(ContentComponent));
