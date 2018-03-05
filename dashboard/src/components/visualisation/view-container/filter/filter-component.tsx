import React, {PureComponent} from 'react';
import {Filter, Operator} from '../../../../lib/view/filter';
import styled from 'styled-components';
import {Button} from 'reactstrap';
import {SuggestInput} from '../suggest-input';
import Input from 'reactstrap/lib/Input';

interface Props
{
    filter: Filter;
    index: number;
    editable: boolean;
    onRemove(index: number): void;
    onChange(index: number, filter: Filter): void;
    calculatePathSuggestions(input: string): string[];
    calculateValueSuggestions(filter: Filter, input: string): string[];
}

const operators: Operator[] = [
    '==',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'contains'
];

const Row = styled.div`
  display: flex;
`;

export class FilterComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <Row>
                {this.props.editable ? this.renderInputs() : this.renderReadonly()}
            </Row>
        );
    }

    renderInputs = (): JSX.Element =>
    {
        return (
            <>
                <SuggestInput
                    value={this.props.filter.path}
                    onChange={val => this.change('path', val)}
                    calculateSuggestions={this.props.calculatePathSuggestions} />
                <Input
                    type='select'
                    name='operator'
                    value={this.props.filter.operator}
                    onChange={val => this.change('operator', val.currentTarget.value)}>
                    {operators.map(this.renderOperator)}
                </Input>
            <SuggestInput
                value={this.props.filter.value}
                onChange={val => this.change('value', val)}
                calculateSuggestions={this.calculateValueSuggestions} />
                {this.props.editable &&
                    <Button onClick={this.remove} color='danger'>Remove</Button>
                }
            </>
        );
    }
    renderReadonly = (): JSX.Element =>
    {
        return (
            <>
                <span>{this.props.filter.path}</span>
                <span>&nbsp;{this.props.filter.operator}&nbsp;</span>
                <span>{this.props.filter.value}</span>
            </>
        );
    }

    renderOperator = (operator: Operator): JSX.Element =>
    {
        return <option key={operator} value={operator}>{operator}</option>;
    }

    change = (attribute: keyof Filter, value: string) =>
    {
        if (!this.props.editable) return;

        const filter = {...this.props.filter};
        filter[attribute] = value;

        this.props.onChange(this.props.index, filter);
    }
    remove = () =>
    {
        this.props.onRemove(this.props.index);
    }

    calculateValueSuggestions = (value: string): string[] =>
    {
        if (this.props.filter.operator === '==' &&
            this.props.filter.path.length > 0)
        {
            return this.props.calculateValueSuggestions(this.props.filter, value);
        }

        return [];
    }
}
