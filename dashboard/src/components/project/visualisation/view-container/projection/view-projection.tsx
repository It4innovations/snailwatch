import React, {PureComponent} from 'react';
import {Projection} from '../../../../../lib/view/projection';
import {Measurement} from '../../../../../lib/measurement/measurement';
import {AxisInput} from './axis-input';

interface Props
{
    projection: Projection;
    measurements: Measurement[];
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

        return <AxisInput
                    value={this.props.projection[key]}
                    measurements={this.props.measurements}
                    onChange={(value: string) => this.handleChange(value, key)} />;
    }

    handleChange = (value: string, key: keyof Projection) =>
    {
        this.props.onChange({
            ...this.props.projection,
            [key]: value
        });
    }
}
