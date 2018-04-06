import React, {PureComponent} from 'react';
import Autosuggest, {
    InputProps, RenderSuggestionParams, SuggestionSelectedEventData, SuggestionsFetchRequestedParams
} from 'react-autosuggest';
import {chain, dissoc} from 'ramda';
import {Input} from 'reactstrap';

import theme from './suggest-input.scss';

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
    state: State = {
        suggestions: []
    };

    render()
    {
        return <Autosuggest
                theme={theme}
                inputProps={{
                    value: this.props.value,
                    onChange: this.handleChange
                }}
                renderInputComponent={this.renderInput}
                suggestions={this.state.suggestions}
                getSuggestionValue={s => s}
                renderSuggestion={this.renderSuggestion}
                onSuggestionsFetchRequested={this.calculateSuggestions}
                onSuggestionsClearRequested={this.clearSuggestions}
                onSuggestionSelected={this.onSuggestionSelected} />;
    }
    renderSuggestion = (suggestion: string, params: RenderSuggestionParams): JSX.Element =>
    {
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
    renderInput = (props: InputProps<string>): JSX.Element =>
    {
        // https://github.com/moroshko/react-autosuggest/issues/318
        const ref = props.ref;
        const properties = dissoc('ref', props);

        return <Input {...properties} type='text' innerRef={ref} />;
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
