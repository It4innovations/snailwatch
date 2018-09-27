import {equals} from 'ramda';
import React, {ChangeEvent, PureComponent} from 'react';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router';
import {Button, Input, InputGroup} from 'reactstrap';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import styled from 'styled-components';
import {Project} from '../../lib/project/project';
import {User} from '../../lib/user/user';
import {AppState} from '../../state/app/reducers';
import {getSelectedProject} from '../../state/session/project/reducers';
import {changePasswordAction, ChangePasswordParams, UserActions} from '../../state/session/user/actions';
import {getUser} from '../../state/session/user/reducers';
import {Request} from '../../util/request';
import {RequestComponent} from '../global/request/request-component';
import {PasswordForm} from './password-form';

interface StateProps
{
    user: User;
    selectedProject: Project | null;
    userRequest: Request;
    changePasswordRequest: Request;
}
interface DispatchProps
{
    changeUser(user: User): void;
    changePassword(params: ChangePasswordParams): void;
}

type Props = StateProps & DispatchProps & RouteComponentProps<void>;

interface State
{
    user: User;
}

const Section = styled.div`
  margin-bottom: 5px;
`;
const SaveButton = styled(Button)`
  margin-top: 5px;
`;

class ProfileComponent extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            user: {...props.user}
        };
    }

    componentDidUpdate(prevProps: Props)
    {
        if (prevProps.user !== this.props.user)
        {
            this.setState((state, props) => ({
                user: {...props.user}
            }));
        }
    }

    render()
    {
        return (
            <div>
                <Section>
                    <RequestComponent request={this.props.userRequest} />
                    <h4>Account details</h4>
                    <InputGroup>
                        <InputGroupAddon addonType='prepend'>Username</InputGroupAddon>
                        <Input id='username' value={this.state.user.username} disabled />
                    </InputGroup>
                    <InputGroup>
                        <InputGroupAddon addonType='prepend'>E-mail</InputGroupAddon>
                        <Input id='email' value={this.state.user.email} onChange={this.changeUserAttribute('email')} />
                    </InputGroup>
                    {this.isDirty() && <SaveButton color='success' onClick={this.saveUser}>Save</SaveButton>}
                </Section>
                <Section>
                    <h4>Change password</h4>
                    <PasswordForm
                        changePasswordRequest={this.props.changePasswordRequest}
                        onChangePassword={this.changePassword} />
                </Section>
            </div>
        );
    }

    changeUserAttribute = (key: keyof User) => (event: ChangeEvent<HTMLInputElement>) =>
    {
        const value = event.currentTarget.value;
        this.setState(state => ({
            user: {...state.user, [key]: value.trim()}
        }));
    }
    changePassword = (oldPassword: string, newPassword: string) =>
    {
        this.props.changePassword({
            oldPassword,
            newPassword
        });
    }

    isDirty = () =>
    {
        return !equals(this.props.user, this.state.user);
    }
    saveUser = () =>
    {
        this.props.changeUser(this.state.user);
    }
}

export const Profile = withRouter(connect<StateProps, DispatchProps>((state: AppState) => ({
    user: getUser(state),
    selectedProject: getSelectedProject(state),
    userRequest: state.session.user.userRequest,
    changePasswordRequest: state.session.user.changePasswordRequest
}), {
    changeUser: UserActions.update.started,
    changePassword: changePasswordAction.started
})(ProfileComponent));
