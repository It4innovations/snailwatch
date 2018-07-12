import React, {PureComponent} from 'react';
import {Button, Input, InputGroup, InputGroupAddon} from 'reactstrap';
import {Request} from '../../util/request';
import {toast, ToastContainer} from 'react-toastify';
import {ErrorBox} from '../global/error-box';
import {Loading} from '../global/loading';

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

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State>
    {
        if (nextProps.changePasswordRequest.completed)
        {
            if (!nextProps.changePasswordRequest.error)
            {
                return {
                    form: {
                        old: '',
                        new: '',
                        newRepeated: ''
                    },
                    error: ''
                };
            }
            else
            {
                return {
                    error: nextProps.changePasswordRequest.error
                };
            }
        }
        return null;
    }

    componentDidUpdate(prevProps: Props, prevState: State)
    {
        if (this.props.changePasswordRequest.completed &&
            !this.props.changePasswordRequest.error &&
            !prevProps.changePasswordRequest.completed)
        {
            toast.success('Password successfully updated');
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
                <ErrorBox error={this.getActiveError()} />
                <Loading show={this.props.changePasswordRequest.loading} />
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
