import React, {PureComponent} from 'react';
import {Filter, Operator} from '../../../../lib/measurement/selection/filter';
import styled from 'styled-components';
import {SuggestInput} from '../../../global/suggest-input';
import Input from 'reactstrap/lib/Input';
import {sort} from 'ramda';
import MdDelete from 'react-icons/lib/md/delete';

interface Props
{
    filter: Filter;
    index: number;
    editable: boolean;
    pathKeys: string[];
    onRemove(index: number): void;
    onChange(index: number, filter: Filter): void;
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
  min-width: 300px;
`;
const DeleteIcon = styled(MdDelete)`
  padding-top: 3px;
`;
const Operator = styled(Input)`
  width: 100px !important;
`;
const Filter = styled.span`
  font-size: 14px;
`;
const IconWrapper = styled.div`
  width: 40px;
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
            <Row>
                <SuggestInput
                    value={this.props.filter.path}
                    onChange={val => this.change('path', val)}
                    calculateSuggestions={this.calculatePathSuggestions}>
                </SuggestInput>
                <Operator
                    bsSize='sm'
                    type='select'
                    name='operator'
                    value={this.props.filter.operator}
                    onChange={val => this.change('operator', val.currentTarget.value)}>
                    {operators.map(this.renderOperator)}
                </Operator>
                <SuggestInput
                    value={this.props.filter.value}
                    onChange={val => this.change('value', val)}
                    calculateSuggestions={this.calculateValueSuggestions} />
                {this.props.editable &&
                    <IconWrapper title='Delete filter'>
                        <DeleteIcon size={26} onClick={this.remove} />
                    </IconWrapper>
                }
            </Row>
        );
    }
    renderReadonly = (): JSX.Element =>
    {
        return (
            <Filter>
                {this.props.filter.path}&nbsp;{this.props.filter.operator}&nbsp;{this.props.filter.value}
            </Filter>
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

    calculatePathSuggestions = (input: string): string[] =>
    {
        const lowerCaseInput = input.toLocaleLowerCase();
        return sort(
            (a, b) => a.localeCompare(b),
            this.props.pathKeys.filter(key => key.toLocaleLowerCase().includes(lowerCaseInput))
        );
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
