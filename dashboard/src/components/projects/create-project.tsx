import React, {FormEvent, PureComponent} from 'react';
import {Button} from 'reactstrap';

interface Props
{
    onCreateRequest(name: string): void;
}

export class CreateProject extends PureComponent<Props>
{
    private name: HTMLInputElement;

    render()
    {
        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Name</label>
                    <input type='text' name='name' required ref={name => this.name = name} />
                    <Button type='submit' color='success'>Create project</Button>
                </form>
            </div>
        );
    }

    handleSubmit = (event: FormEvent<HTMLFormElement>) =>
    {
        event.preventDefault();
        this.props.onCreateRequest(this.name.value);
    }
}
