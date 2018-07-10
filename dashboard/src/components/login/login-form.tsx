import React, {FormEvent, PureComponent} from 'react';
import {Button, Input, Label} from 'reactstrap';
import styled from 'styled-components';
import {Loading} from '../global/loading';

interface Props
{
    loading: boolean;
    handleSubmit(username: string, password: string): void;
}
interface State
{
    username: string;
    password: string;
}

const Wrapper = styled.div`
  width: 400px;
`;
const Row = styled.div`
  margin-top: 15px;
`;
const InputLabel = styled(Label)`
  margin-bottom: 0;
`;
const LoginButton = styled(Button)`
  margin-right: 10px;
`;
const LoginWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

export class LoginForm extends PureComponent<Props, State>
{
    state: State = {
        username: '',
        password: ''
    };

    render()
    {
        return (
            <Wrapper>
                <form onSubmit={this.handleSubmit}>
                    <Row>
                        <InputLabel htmlFor='username'>Username</InputLabel>
                        <Input name='username'
                               id='username'
                               type='text'
                               required={true}
                               value={this.state.username}
                               onChange={e => this.change('username', e.currentTarget.value)} />
                    </Row>
                    <Row>
                        <InputLabel htmlFor='password'>Password</InputLabel>
                        <Input name='password'
                               id='password'
                               type='password'
                               required={true}
                               value={this.state.password}
                               onChange={e => this.change('password', e.currentTarget.value)} />
                    </Row>
                    <LoginWrapper>
                        <LoginButton type='submit' color='success'>Login</LoginButton>
                        <Loading show={this.props.loading} />
                    </LoginWrapper>
                </form>
            </Wrapper>
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
