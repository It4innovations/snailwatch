import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {AppState} from '../../state/app/reducers';
import {loginUser} from '../../state/session/user/actions';
import {Request} from '../../util/request';
import {ErrorBox} from '../global/error-box';
import {LoginForm} from './login-form';

interface StateProps
{
    loginRequest: Request;
}
interface DispatchProps
{
    loginUser(data: {username: string, password: string}): void;
}

class LoginComponent extends PureComponent<StateProps & DispatchProps & RouteComponentProps<void>>
{
    render()
    {
        return (
            <div>
                <ErrorBox error={this.props.loginRequest.error} />
                <LoginForm handleSubmit={this.tryLogin}
                           loading={this.props.loginRequest.loading} />
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

export const Login = withRouter(connect<StateProps, DispatchProps, {}>((state: AppState) => ({
    loginRequest: state.session.user.loginRequest
}), {
    loginUser: loginUser.started
})(LoginComponent));
