import React, {PureComponent} from 'react';
import {Project} from '../../lib/project/project';
import {Input, InputGroup} from 'reactstrap';
import {User} from '../../lib/user/user';
import {RouteComponentProps, withRouter} from 'react-router';
import {getUser} from '../../state/session/user/reducer';
import { getSelectedProject} from '../../state/session/project/reducer';
import {AppState} from '../../state/app/reducers';
import {connect} from 'react-redux';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import styled from 'styled-components';
import {PasswordForm} from './password-form';
import {changePassword, ChangePasswordParams} from '../../state/session/user/actions';
import {Request} from '../../util/request';

interface StateProps
{
    user: User;
    selectedProject: Project | null;
    changePasswordRequest: Request;
}
interface DispatchProps
{
    changePassword(params: ChangePasswordParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

const Section = styled.div`
  margin-bottom: 5px;
`;

class ProfileComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <Section>
                    <h4>Account details</h4>
                    <InputGroup>
                        <InputGroupAddon addonType='prepend'>Username</InputGroupAddon>
                        <Input id='username' value={this.props.user.username} disabled />
                    </InputGroup>
                </Section>
                <Section>
                    <h4>Change password</h4>
                    <PasswordForm
                        changePasswordRequest={this.props.changePasswordRequest}
                        onChangePassword={this.onChangePassword} />
                </Section>
            </div>
        );
    }

    onChangePassword = (oldPassword: string, newPassword: string) =>
    {
        this.props.changePassword({
            oldPassword,
            newPassword
        });
    }
}

export const Profile = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    selectedProject: getSelectedProject(state),
    changePasswordRequest: state.session.user.changePasswordRequest
}), {
    changePassword: changePassword.started
})(ProfileComponent));
