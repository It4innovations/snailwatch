import React, {PureComponent} from 'react';
import {createFilter, Filter, Operator} from '../../../../lib/filter/filter';
import styled from 'styled-components';
import {Button} from 'react-bootstrap';
import {equals} from 'ramda';

interface Props
{
    filter: Filter;
    onRemove(): void;
    onChange(filter: Filter): void;
}

interface State
{
    filter: Filter;
    dirty: boolean;
}

const operators: Operator[] = [
    '==',
    '!=',
    '<',
    '<=',
    '>',
    '>='
];

const Row = styled.div`
  display: flex;
`;

export class FilterComponent extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            dirty: false,
            filter: createFilter()
        };
    }

    componentWillReceiveProps(props: Props)
    {
        if (props.filter !== this.props.filter)
        {
            this.setState(() => ({
                dirty: false,
                filter: {...props.filter}
            }));
        }
    }

    render()
    {
        return (
            <Row>
                <input type='text' name='path'
                       value={this.state.filter.path}
                       onChange={val => this.change('path', val.currentTarget.value)} />
                <select name='operator'
                        value={this.state.filter.operator}
                        onChange={val =>
                            this.change('operator', val.currentTarget.value)}>
                    {operators.map(this.renderOperator)}
                </select>
                <input type='text' name='value'
                       value={this.state.filter.value}
                       onChange={val => this.change('value', val.currentTarget.value)} />
                {this.state.dirty && <Button bsStyle='success' onClick={this.handleSubmit}>Apply</Button>}
                <Button bsStyle='danger' onClick={this.props.onRemove}>Remove</Button>
            </Row>
        );
    }

    renderOperator = (operator: Operator): JSX.Element =>
    {
        return <option key={operator} value={operator}>{operator}</option>;
    }
    handleSubmit = () =>
    {
        this.props.onChange({...this.state.filter});
    }

    change = (attribute: keyof Filter, value: string) =>
    {
        const filter = {...this.state.filter};
        filter[attribute] = value;

        this.setState(() => ({
            dirty: !equals(filter, this.props.filter),
            filter
        }));
    }
}
