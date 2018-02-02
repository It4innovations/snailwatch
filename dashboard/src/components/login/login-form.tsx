import React, {FormEvent, PureComponent} from 'react';
import {Button} from 'react-bootstrap';

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
    constructor(props: Props)
    {
        super(props);

        this.state = {
            username: '1',
            password: '1'
        };
    }

    render()
    {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label htmlFor='username'>Username</label>
                        <input name='username' type='text' required={true}
                               value={this.state.username}
                               onChange={e => this.change('username', e.currentTarget.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input name='password' type='password' required={true}
                               value={this.state.password}
                               onChange={e => this.change('password', e.currentTarget.value)} />
                    </div>
                    <Button bsStyle='primary' type='submit'>Login</Button>
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
