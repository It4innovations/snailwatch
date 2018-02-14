import React, {PureComponent} from 'react';
import {Projection} from '../../../../lib/view/projection';

interface Props
{
    projection: Projection;
    editable: boolean;
    onChange(projection: Projection): void;
}

export class ViewProjection extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                <div>
                    <label>x axis: </label>
                    {this.renderAxis('xAxis')}
                </div>
                <div>
                    <label>y axis: </label>
                    {this.renderAxis('yAxis')}
                </div>
            </div>
        );
    }

    renderAxis = (key: keyof Projection): JSX.Element =>
    {
        if (!this.props.editable)
        {
            return <span>{this.props.projection[key]}</span>;
        }

        return <input type='text' name='{key}'
               value={this.props.projection[key]}
               onChange={e => this.handleChange(e, key)} />;
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>, key: keyof Projection) =>
    {
        const val = e.currentTarget.value;
        this.props.onChange({
            ...this.props.projection,
            [key]: val
        });
    }
}
