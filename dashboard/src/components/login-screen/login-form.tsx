import React, {FormEvent, PureComponent} from 'react';

interface Props
{
    handleSubmit: (username: string, password: string) => void;
}

export class LoginForm extends PureComponent<Props>
{
    private username: HTMLInputElement;
    private password: HTMLInputElement;

    render()
    {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label htmlFor='username'>Username</label>
                        <input name='username' type='text' defaultValue='1' required={true}
                               ref={elem => this.username = elem} />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input name='password' type='password' defaultValue='1' required={true}
                               ref={elem => this.password = elem} />
                    </div>
                    <button>Login</button>
                </form>
            </div>
        );
    }

    handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        this.props.handleSubmit(this.username.value, this.password.value);
    }
}
