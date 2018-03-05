import React, {PureComponent} from 'react';
import {Button, Input, InputGroup, InputGroupAddon, Alert} from 'reactstrap';
import {Request} from '../../util/request';
import {toast, ToastContainer} from 'react-toastify';

interface Props
{
    changePasswordRequest: Request;
    onChangePassword(oldPasword: string, newPassword: string): void;
}

interface Form
{
    old: string;
    new: string;
    newRepeated: string;
}
interface State
{
    form: Form;
    error: string;
}

export class PasswordForm extends PureComponent<Props, State>
{
    state: State = {
        form: {
            old: '',
            new: '',
            newRepeated: ''
        },
        error: ''
    };

    componentWillReceiveProps(props: Props)
    {
        if (props.changePasswordRequest.completed)
        {
            if (!props.changePasswordRequest.error)
            {
                this.setState(() => ({
                    form: {
                        old: '',
                        new: '',
                        newRepeated: ''
                    },
                    error: ''
                }));

                toast.success('Password successfully updated');
            }
            else
            {
                this.setState(() => ({
                    error: props.changePasswordRequest.error
                }));
            }
        }
    }

    render()
    {
        return (
            <>
                <ToastContainer position={toast.POSITION.TOP_RIGHT} autoClose={false} />
                <InputGroup>
                    <InputGroupAddon addonType='prepend'>Current password</InputGroupAddon>
                    <Input type='password'
                           value={this.state.form.old}
                           onChange={e => this.changePasswordValue('old', e.currentTarget.value)} />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType='prepend'>Password</InputGroupAddon>
                    <Input type='password'
                           value={this.state.form.new}
                           onChange={e => this.changePasswordValue('new', e.currentTarget.value)} />
                </InputGroup>
                <InputGroup>
                    <InputGroupAddon addonType='prepend'>Repeat password</InputGroupAddon>
                    <Input type='password'
                           value={this.state.form.newRepeated}
                           onChange={e => this.changePasswordValue('newRepeated', e.currentTarget.value)} />
                </InputGroup>
                {this.getActiveError() && <Alert color='danger'>{this.getActiveError()}</Alert>}
                {this.props.changePasswordRequest.loading && <div>Loading...</div>}
                <Button onClick={this.tryChangePassword}>Change password</Button>
            </>
        );
    }

    changePasswordValue = (key: keyof Form, value: string) =>
    {
        this.setState(state => ({
            form: {
                ...state.form,
                [key]: value
            }
        }));
    }

    tryChangePassword = () =>
    {
        const error = this.validateForm();
        if (error !== null)
        {
            this.setState(() => ({ error }));
        }
        else this.props.onChangePassword(this.state.form.old, this.state.form.new);
    }

    getActiveError = (): string =>
    {
        return this.state.error;
    }

    validateForm = (): string | null =>
    {
        if (this.state.form.new !== this.state.form.newRepeated)
        {
            return 'The password do not match';
        }
        else if (this.state.form.new === '')
        {
            return 'The password cannot be empty';
        }
        else if (this.state.form.new.length < 8)
        {
            return 'The password must have at least 8 characters';
        }
        else if (this.state.form.old === '')
        {
            return 'You have to fill in the current password';
        }

        return null;
    }
}
