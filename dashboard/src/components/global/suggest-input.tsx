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

interface Props<T>
{
    value: string;
    onChange?(value: string): void;
    onSuggestionSelected?(value: T): void;
    getSuggestionValue?(value: T): string;
    calculateSuggestions(input: string): T[];
}

interface State<T>
{
    suggestions: T[];
}

const Suggestion = styled.div`
  font-size: 12px;
`;

export class SuggestInput<T = string> extends PureComponent<Props<T>, State<T>>
{
    state: State<T> = {
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
                getSuggestionValue={this.getSuggestionValue}
                renderSuggestion={this.renderSuggestion}
                onSuggestionsFetchRequested={this.calculateSuggestions}
                onSuggestionsClearRequested={this.clearSuggestions}
                onSuggestionSelected={this.onSuggestionSelected} />;
    }
    renderSuggestion = (suggestion: T, params: RenderSuggestionParams): JSX.Element =>
    {
        const suggestionValue = this.getSuggestionValue(suggestion);
        const parts = suggestionValue.split(new RegExp(params.query, 'i'));
        const length = params.query.length;

        let queryIndex = 0;
        let i = 0;
        const html = chain(p => {
            queryIndex += p.length;
            const text = [
                    <span key={i++}>{p}</span>,
                    <b key={i++}>{suggestionValue.substr(queryIndex, length)}</b>
            ];
            queryIndex += length;
            return text;
            }, parts
        );
        html.pop();

        return <Suggestion>{html}</Suggestion>;
    }
    renderInput = (props: InputProps<T>): JSX.Element =>
    {
        // https://github.com/moroshko/react-autosuggest/issues/318
        const ref = props.ref;
        const properties = dissoc('ref', props);

        return <Input {...properties} type='text' bsSize='sm' innerRef={ref} />;
    }

    getSuggestionValue = (s: T): string =>
    {
        if (this.props.getSuggestionValue)
        {
            return this.props.getSuggestionValue(s);
        }
        else return s.toString();
    }
    handleChange = (e: React.FormEvent<HTMLInputElement>) =>
    {
        this.onChange(e.currentTarget.value);
    }
    onSuggestionSelected = (event: React.FormEvent<HTMLInputElement>,
                            data: SuggestionSelectedEventData<T>) =>
    {
        this.onChange(data.suggestionValue);
        if (this.props.onSuggestionSelected)
        {
            this.props.onSuggestionSelected(data.suggestion);
        }
    }
    onChange = (value: string) =>
    {
        if (this.props.onChange)
        {
            this.props.onChange(value);
        }
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
