import React, {PureComponent} from 'react';
import {LoginForm} from './login-form';
import {connect} from 'react-redux';
import {loginUser} from '../../state/user/actions';
import {AppState} from '../../state/app/reducers';
import {RouteComponentProps, withRouter} from 'react-router';

interface StateProps
{
    loginInProgress: boolean;
    loginError: string;
}
interface DispatchProps
{
    loginUser: (data: {username: string, password: string}) => void;
}

class LoginScreenComponent extends PureComponent<StateProps & DispatchProps & RouteComponentProps<void>>
{
    render()
    {
        return (
            <div>
                {this.props.loginInProgress && <div>Loading...</div>}
                {this.props.loginError && <div>{this.props.loginError.toString()}</div>}
                <LoginForm handleSubmit={this.tryLogin} />
            </div>
        );
    }

    tryLogin = (username: string, password: string) =>
    {
        this.props.loginUser({
            username,
            password
        });
    }
}

export const LoginScreen = withRouter(connect<StateProps, DispatchProps, {}>((state: AppState) => ({
    loginInProgress: state.user.loginInProgress,
    loginError: state.user.loginError
}), {
    loginUser: loginUser.started
})(LoginScreenComponent));
