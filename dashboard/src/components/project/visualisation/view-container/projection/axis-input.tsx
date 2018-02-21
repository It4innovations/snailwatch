import React, {PureComponent} from 'react';
import Autosuggest, {
    RenderSuggestionParams, SuggestionSelectedEventData, SuggestionsFetchRequestedParams
} from 'react-autosuggest';
import {Measurement} from '../../../../../lib/measurement/measurement';
import {getAllKeysRecursive} from '../../../../../util/object';
import {reduce, uniq, chain} from 'ramda';

interface Props
{
    value: string;
    measurements: Measurement[];
    onChange(value: string): void;
}

interface State
{
    suggestions: string[];
}

export class AxisInput extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            suggestions: []
        };
    }

    render()
    {
        return <Autosuggest
                inputProps={{
                    value: this.props.value,
                    onChange: this.handleChange
                }}
                suggestions={this.state.suggestions}
                getSuggestionValue={s => s}
                renderSuggestion={this.renderSuggestion}
                onSuggestionsFetchRequested={this.calculateSuggestions}
                onSuggestionsClearRequested={this.clearSuggestions}
                onSuggestionSelected={this.onSuggestionSelected} />;
    }
    renderSuggestion = (suggestion: string, params: RenderSuggestionParams): JSX.Element =>
    {
        if (params.query.length === 0)
        {
            return <div>{suggestion}</div>;
        }

        const parts = suggestion.split(params.query);
        let i = 0;
        const html = chain(p => [
                <span key={i++}>{p}</span>,
                <b key={i++}>{params.query}</b>
            ], parts
        );
        html.pop();

        return <div>{html}</div>;
    }

    handleChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.props.onChange(e.currentTarget.value);
    }
    onSuggestionSelected = (event: React.FormEvent<HTMLInputElement>,
                            data: SuggestionSelectedEventData<string>) =>
    {
        this.props.onChange(data.suggestionValue);
    }

    calculateSuggestions = (params: SuggestionsFetchRequestedParams) =>
    {
        const value = params.value.trim().toLowerCase();
        const keys = this.getKeys(this.props.measurements);
        const suggestions: string[] = keys.filter(k => k.includes(value));
        suggestions.sort();

        this.setState(() => ({
            suggestions
        }));
    }
    clearSuggestions = () =>
    {
        this.setState(() => ({
            suggestions: []
        }));
    }

    getKeys = (measurements: Measurement[]): string[] =>
    {
        return reduce((acc, measurement) => {
            const keys = getAllKeysRecursive({
                timestamp: '',
                benchmark: measurement.benchmark,
                environment: measurement.environment,
                result: measurement.result
            });

            return uniq(acc.concat(keys));
        }, [], measurements);
    }
}
