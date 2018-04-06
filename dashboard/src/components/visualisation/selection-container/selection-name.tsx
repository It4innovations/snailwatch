import React, {PureComponent} from 'react';
import {Selection} from '../../../lib/measurement/selection/selection';
import Input from 'reactstrap/lib/Input';

interface Props
{
    selection: Selection;
    editable: boolean;
    onChange(name: string): void;
}

export class SelectionName extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <h2>Name</h2>
                {this.renderName()}
            </div>
        );
    }

    renderName = (): JSX.Element =>
    {
        if (!this.props.editable)
        {
            return <span>{this.props.selection.name}</span>;
        }

        return <Input type='text'
                      required={true}
                      value={this.props.selection.name}
                      onChange={this.handleChange} />;
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onChange(e.currentTarget.value);
    }
}
