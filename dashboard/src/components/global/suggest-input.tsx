import {chain, dissoc} from 'ramda';
import React, {PureComponent} from 'react';
import Autosuggest, {
    InputProps,
    RenderSuggestionParams,
    SuggestionSelectedEventData,
    SuggestionsFetchRequestedParams
} from 'react-autosuggest';
import {Input} from 'reactstrap';
import styled from 'styled-components';
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

const Suggestion = styled.div`
  font-size: 12px;
`;

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
        const parts = suggestion.split(new RegExp(params.query, 'i'));
        const length = params.query.length;

        let queryIndex = 0;
        let i = 0;
        const html = chain(p => {
            queryIndex += p.length;
            const text = [
                    <span key={i++}>{p}</span>,
                    <b key={i++}>{suggestion.substr(queryIndex, length)}</b>
            ];
            queryIndex += length;
            return text;
            }, parts
        );
        html.pop();

        return <Suggestion>{html}</Suggestion>;
    }
    renderInput = (props: InputProps<string>): JSX.Element =>
    {
        // https://github.com/moroshko/react-autosuggest/issues/318
        const ref = props.ref;
        const properties = dissoc('ref', props);

        return <Input {...properties} type='text' bsSize='sm' innerRef={ref} />;
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
