import React, {PureComponent} from 'react';
import {LoginForm} from './login-form';
import {connect} from 'react-redux';
import {loginUser} from '../../state/user/actions';
import {AppState} from '../../state/app/reducers';
import {RouteComponentProps, withRouter} from 'react-router';
import {Request} from '../../util/request';

interface StateProps
{
    loginRequest: Request;
}
interface DispatchProps
{
    loginUser: (data: {username: string, password: string}) => void;
}

class LoginComponent extends PureComponent<StateProps & DispatchProps & RouteComponentProps<void>>
{
    render()
    {
        return (
            <div>
                {this.props.loginRequest.loading && <div>Loading...</div>}
                {this.props.loginRequest.error && <div>{this.props.loginRequest.error.toString()}</div>}
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
    loginRequest: state.user.loginRequest
}), {
    loginUser: loginUser.started
})(LoginComponent));
