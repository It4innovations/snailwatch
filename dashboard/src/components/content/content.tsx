import React, {PureComponent} from 'react';
import styles from '../../App.scss';
import {ProjectsScreen} from '../projects-screen/projects-screen';
import {LoginScreen} from '../login-screen/login-screen';
import {Routes} from '../../state/nav/routes';
import {Redirect, RouteComponentProps, Switch, withRouter} from 'react-router';
import {connect} from 'react-redux';
import {AppState} from '../../state/app/reducers';
import {isUserAuthenticated} from '../../state/user/reducer';
import {Menu} from './menu';
import {logoutUser} from '../../state/user/actions';
import {SwitchRoute} from '../../state/nav/switch-route';

interface StateProps
{
    authenticated: boolean;
}
interface DispatchProps
{
    onLogout: () => void;
}

class ContentComponent extends PureComponent<StateProps & DispatchProps & RouteComponentProps<void>>
{
    render()
    {
        return (
            <div className={styles.app}>
                <Menu authenticated={this.props.authenticated} onLogout={this.props.onLogout} />
                <div className='content'>
                    <Switch>
                        <SwitchRoute path={Routes.Login} component={LoginScreen}
                                     usePrimaryRoute={!this.props.authenticated} redirect={Routes.Projects} />
                        <SwitchRoute path={Routes.Projects} component={ProjectsScreen}
                                     usePrimaryRoute={this.props.authenticated} redirect={Routes.Login} />
                        {this.props.authenticated && <Redirect to={Routes.Projects} />}
                        {!this.props.authenticated && <Redirect to={Routes.Login} />}
                    </Switch>
                </div>
            </div>
        );
    }
}

export const Content = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    authenticated: isUserAuthenticated(state)
}), {
    onLogout: logoutUser
})(ContentComponent));
