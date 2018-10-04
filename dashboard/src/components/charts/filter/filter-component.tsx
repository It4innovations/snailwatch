import {equals, sort} from 'ramda';
import React, {PureComponent} from 'react';
import FaCheck from 'react-icons/lib/fa/check';
import FaTrash from 'react-icons/lib/fa/trash';
import MdCancel from 'react-icons/lib/md/cancel';
import {Badge, Button, ButtonGroup} from 'reactstrap';
import Input from 'reactstrap/lib/Input';
import styled from 'styled-components';
import {createFilter, Filter, Operator} from '../../../lib/view/filter';
import {SuggestInput} from '../../global/suggest-input';

interface Props
{
    filter: Filter;
    pathKeys: string[];
    className?: string;
    onRemove(filter: Filter): void;
    onChange(filter: Filter): void;
    calculateValueSuggestions(filter: Filter, input: string): string[];
}

const initialState = {
    filter: createFilter(),
    editable: false
};

type State = Readonly<typeof initialState>;

const operators: Operator[] = [
    '==',
    '!=',
    '<',
    '<=',
    '>',
    '>=',
    'contains',
    'is defined'
];

const Row = styled.div`
  display: flex;
  align-items: center;
  min-width: 300px;
`;
const Operator = styled(Input)`
  width: 100px !important;
`;
const Filter = styled(Badge)`
  font-size: 14px !important;
  cursor: pointer;
  &:hover {
    background-color: #545B62;
  }
`;
const ActionButton = styled(Button)`
  padding: 0.15rem 0.25rem !important;
`;
const ControlWrapper = styled(ButtonGroup)`
  margin-left: 10px;
`;

export class FilterComponent extends PureComponent<Props, State>
{
    readonly state = initialState;

    componentDidUpdate(prevProps: Props)
    {
        if (this.props.filter !== prevProps.filter)
        {
            this.setState({
                editable: false
            });
        }
    }

    render()
    {
        return (
            <div className={this.props.className}>
                {this.state.editable ? this.renderInputs() : this.renderReadonly()}
            </div>
        );
    }

    renderInputs = (): JSX.Element =>
    {
        return (
            <Row>
                <SuggestInput
                    value={this.state.filter.path}
                    onChange={val => this.change('path', val)}
                    calculateSuggestions={this.calculatePathSuggestions}>
                </SuggestInput>
                <Operator
                    bsSize='sm'
                    type='select'
                    name='operator'
                    value={this.state.filter.operator}
                    onChange={val => this.change('operator', val.currentTarget.value)}>
                    {operators.map(this.renderOperator)}
                </Operator>
                {this.state.filter.operator !== 'is defined' &&
                    <SuggestInput
                        value={this.state.filter.value}
                        onChange={val => this.change('value', val)}
                        calculateSuggestions={this.calculateValueSuggestions} />
                }
                {this.state.editable &&
                    <ControlWrapper>
                        <ActionButton outline
                                      size='sm'
                                      color='success'
                                      title='Confirm changes'
                                      onClick={this.commit}>
                            <FaCheck size={20} />
                        </ActionButton>
                        <ActionButton outline
                                      size='sm'
                                      title='Cancel changes'
                                      onClick={this.stopEdit}>
                            <MdCancel size={20} />
                        </ActionButton>
                        <ActionButton outline
                                      size='sm'
                                      color='danger'
                                      title='Delete filter'
                                      onClick={this.remove}>
                            <FaTrash size={20} />
                        </ActionButton>
                    </ControlWrapper>
                }
            </Row>
        );
    }
    renderReadonly = (): JSX.Element =>
    {
        return (
            <Filter title='Edit filter' onClick={this.startEdit}>
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
        if (!this.state.editable) return;

        const filter = {...this.state.filter};
        filter[attribute] = value;

        if (attribute === 'operator' && value === 'is defined')
        {
            filter.value = '';
        }

        this.setState({ filter });
    }
    commit = () =>
    {
        this.stopEdit();

        if (!equals(this.state.filter, this.props.filter))
        {
            this.props.onChange(this.state.filter);
        }
    }
    remove = () =>
    {
        this.props.onRemove(this.props.filter);
    }

    stopEdit = () =>
    {
        this.setState({ editable: false });
    }
    startEdit = () =>
    {
        this.setState((state, props) => ({
            filter: {...props.filter},
            editable: true
        }));
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
        if (this.state.filter.operator === '==' &&
            this.state.filter.path.length > 0)
        {
            return this.props.calculateValueSuggestions(this.state.filter, value);
        }

        return [];
    }
}
