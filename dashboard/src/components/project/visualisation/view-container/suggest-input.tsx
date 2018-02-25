import React, {PureComponent} from 'react';
import Autosuggest, {
    RenderSuggestionParams, SuggestionSelectedEventData, SuggestionsFetchRequestedParams
} from 'react-autosuggest';
import {chain} from 'ramda';

interface Props
{
    value: string;
    onChange(value: string): void;
    calculateSuggestions(input: string): string[];
}

interface State
{
    suggestions: string[];
}

export class SuggestInput extends PureComponent<Props, State>
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
        const suggestions = this.props.calculateSuggestions(value);

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
}