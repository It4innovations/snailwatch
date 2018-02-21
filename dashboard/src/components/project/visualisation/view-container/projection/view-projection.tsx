import React, {PureComponent} from 'react';
import {Projection} from '../../../../../lib/view/projection';
import {SuggestInput} from '../suggest-input';

interface Props
{
    projection: Projection;
    editable: boolean;
    measurementKeys: string[];
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

        return <SuggestInput
                    value={this.props.projection[key]}
                    onChange={(value: string) => this.handleChange(value, key)}
                    calculateSuggestions={this.calculateSuggestions} />;
    }

    handleChange = (value: string, key: keyof Projection) =>
    {
        this.props.onChange({
            ...this.props.projection,
            [key]: value
        });
    }

    calculateSuggestions = (input: string): string[] =>
    {
        const suggestions = this.props.measurementKeys.filter(k => k.includes(input));
        suggestions.sort();
        return suggestions;
    }
}
