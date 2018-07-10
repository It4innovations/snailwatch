import React, {FormEvent, PureComponent} from 'react';
import {Button, Input} from 'reactstrap';
import styled from 'styled-components';

interface Props
{
    onCreateRequest(name: string): void;
}

const Wrapper = styled.div`
  width: 400px;
`;
const Name = styled(Input)`
  margin-bottom: 10px;
`;

export class CreateProject extends PureComponent<Props>
{
    private name: HTMLInputElement;

    render()
    {
        return (
            <Wrapper>
                <form onSubmit={this.handleSubmit}>
                    <Name type='text' name='name' placeholder='Name' required innerRef={name => this.name = name} />
                    <Button type='submit' color='success'>Create project</Button>
                </form>
            </Wrapper>
        );
    }

    handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        this.props.onCreateRequest(this.name.value);
    }
}
