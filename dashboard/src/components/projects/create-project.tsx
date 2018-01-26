import React, {FormEvent, PureComponent} from 'react';

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
                    <input type='text' name='name' ref={name => this.name = name} />
                    <button>Create project</button>
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
