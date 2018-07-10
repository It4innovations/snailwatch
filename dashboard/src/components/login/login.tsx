import React, {PureComponent} from 'react';
import {LoginForm} from './login-form';
import {connect} from 'react-redux';
import {loginUser} from '../../state/session/user/actions';
import {AppState} from '../../state/app/reducers';
import {RouteComponentProps, withRouter} from 'react-router';
import {Request} from '../../util/request';
import {ErrorBox} from '../global/error-box';

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
                {this.props.loginRequest.loading && <div>Loading...</div>}
                <ErrorBox error={this.props.loginRequest.error} />
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

export const Login = withRouter(connect<StateProps, DispatchProps, {}>((state: AppState) => ({
    loginRequest: state.session.user.loginRequest
}), {
    loginUser: loginUser.started
})(LoginComponent));
