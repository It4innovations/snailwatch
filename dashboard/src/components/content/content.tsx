import React, {PureComponent} from 'react';
import {Projects} from '../projects/projects';
import {Login} from '../login/login';
import {Navigation, projectRoute, Routes} from '../../state/nav/routes';
import {Redirect, RouteComponentProps, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {AppState} from '../../state/app/reducers';
import {isUserAuthenticated} from '../../state/user/reducer';
import {Menu} from './menu';
import {logoutUser} from '../../state/user/actions';
import {SwitchRoute} from '../../state/nav/switch-route';
import styled from 'styled-components';
import {Profile} from '../profile/profile';
import {Project} from '../../lib/project/project';
import {getSelectedProject} from '../../state/project/reducer';

interface StateProps
{
    authenticated: boolean;
    selectedProject: Project | null;
}
interface DispatchProps
{
    onLogout(): void;
}

const Wrapper = styled.div`
    width: 100%;
    margin: 0;
    padding: 5px;
`;

class ContentComponent extends PureComponent<StateProps & DispatchProps & RouteComponentProps<void>>
{
    render()
    {
        return (
            <Wrapper>
                <Menu authenticated={this.props.authenticated}
                      selectedProject={this.props.selectedProject}
                      onLogout={this.props.onLogout} />
                <Switch>
                    <SwitchRoute path={Routes.Login} component={Login}
                                 usePrimaryRoute={!this.props.authenticated} redirect={Navigation.Projects} />
                    {this.authRoute(Routes.Projects, Projects)}
                    {this.authRoute(Routes.Profile, Profile)}
                    {this.getAuthenticatedRedirect()}
                    {!this.props.authenticated && <Redirect to={Navigation.Login} />}
                </Switch>
            </Wrapper>
        );
    }

    getAuthenticatedRedirect = (): JSX.Element =>
    {
        if (this.props.authenticated)
        {
            if (this.props.selectedProject !== null)
            {
                return <Redirect to={projectRoute(this.props.selectedProject.name)} />;
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
}

export const Content = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    authenticated: isUserAuthenticated(state),
    selectedProject: getSelectedProject(state)
}), {
    onLogout: logoutUser
})(ContentComponent));
