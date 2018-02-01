import React, {PureComponent} from 'react';
import {Projects} from '../projects/projects';
import {Login} from '../login/login';
import {Navigation, Routes} from '../../state/nav/routes';
import {Redirect, RouteComponentProps, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {AppState} from '../../state/app/reducers';
import {isUserAuthenticated} from '../../state/user/reducer';
import {Menu} from './menu';
import {logoutUser} from '../../state/user/actions';
import {SwitchRoute} from '../../state/nav/switch-route';
import styled from 'styled-components';

interface StateProps
{
    authenticated: boolean;
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
                <Menu authenticated={this.props.authenticated} onLogout={this.props.onLogout} />
                <Switch>
                    <SwitchRoute path={Routes.Login} component={Login}
                                 usePrimaryRoute={!this.props.authenticated} redirect={Navigation.Projects} />
                    {this.authRoute(Routes.Projects, Projects)}
                    {this.props.authenticated && <Redirect to={Navigation.Projects} />}
                    {!this.props.authenticated && <Redirect to={Navigation.Login} />}
                </Switch>
            </Wrapper>
        );
    }

    authRoute = <T extends {}>(path: string, component: React.ComponentType<T>): JSX.Element =>
    {
        return <SwitchRoute path={path} component={component}
                     usePrimaryRoute={this.props.authenticated} redirect={Navigation.Login} />;
    }
}

export const Content = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    authenticated: isUserAuthenticated(state)
}), {
    onLogout: logoutUser
})(ContentComponent));
