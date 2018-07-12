import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import {InputType} from 'reactstrap/lib/Input';

interface Props
{
    editing: boolean;
    value: string;
    className?: string;
    type?: InputType;
    onChange(value: string): void;
}

export class EditableText extends PureComponent<Props>
{
    render()
    {
        if (this.props.editing)
        {
            const type = this.props.type || 'text';
            return <Input className={this.props.className}
                          bsSize='sm'
                          type={type}
                          value={this.props.value}
                          onChange={this.onChange} />;
        }

        return <div className={this.props.className}>{this.props.value}</div>;
    }

    onChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        const value = e.currentTarget.value;
        this.props.onChange(value);
    }
}
