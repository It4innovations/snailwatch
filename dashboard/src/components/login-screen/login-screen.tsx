import React, {PureComponent} from 'react';
import {LoginForm} from './login-form';
import {connect} from 'react-redux';
import {loginUser} from '../../state/user/actions';
import {AppState} from '../../state/app/reducers';
import {RouteComponentProps, withRouter} from 'react-router';
import {RequestContext} from '../../util/request';

interface StateProps
{
    loginRequest: RequestContext;
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

export const LoginScreen = withRouter(connect<StateProps, DispatchProps, {}>((state: AppState) => ({
    loginRequest: state.user.loginRequest
}), {
    loginUser: loginUser.started
})(LoginScreenComponent));
