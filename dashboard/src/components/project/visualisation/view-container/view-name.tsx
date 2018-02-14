import React, {PureComponent} from 'react';
import {View} from '../../../../lib/view/view';

interface Props
{
    view: View;
    editable: boolean;
    onChange(name: string): void;
}

export class ViewName extends PureComponent<Props>
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
            return <span>{this.props.view.name}</span>;
        }

        return <input type='text' value={this.props.view.name} onChange={this.handleChange} required={true} />;
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onChange(e.currentTarget.value);
    }
}
