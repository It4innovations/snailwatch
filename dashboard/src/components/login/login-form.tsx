import React, {FormEvent, PureComponent} from 'react';
import {Button, Input, Label} from 'reactstrap';

interface Props
{
    handleSubmit(username: string, password: string): void;
}
interface State
{
    username: string;
    password: string;
}

export class LoginForm extends PureComponent<Props, State>
{
    state: State = {
        username: '',
        password: ''
    };

    render()
    {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <Label htmlFor='username'>Username</Label>
                        <Input name='username'
                               id='username'
                               type='text'
                               required={true}
                               value={this.state.username}
                               onChange={e => this.change('username', e.currentTarget.value)} />
                    </div>
                    <div>
                        <Label htmlFor='password'>Password</Label>
                        <Input name='password'
                               id='password'
                               type='password'
                               required={true}
                               value={this.state.password}
                               onChange={e => this.change('password', e.currentTarget.value)} />
                    </div>
                    <Button type='submit' color='success'>Login</Button>
                </form>
            </div>
        );
    }

    change = (key: keyof State, value: string) =>
    {
        const changeObj = {};
        changeObj[key] = value;
        this.setState(() => changeObj);
    }

    handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        this.props.handleSubmit(this.state.username, this.state.password);
    }
}
