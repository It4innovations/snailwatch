import {remove, update} from 'ramda';
import React, {PureComponent} from 'react';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Measurement} from '../../../../lib/measurement/measurement';
import {createFilter, Filter} from '../../../../lib/measurement/selection/filter';
import {getValuesWithPath} from '../../../../util/object';
import {FilterComponent} from './filter-component';

interface Props
{
    filters: Filter[];
    editable: boolean;
    measurementKeys: string[];
    measurements: Measurement[];
    onChange(filters: Filter[]): void;
}

const Wrapper = styled.div`
  margin-bottom: 5px;
`;
const AddButton = styled(Button)`
  margin-top: 5px;
`;

export class FilterList extends PureComponent<Props>
{
    render()
    {
        return (
            <Wrapper>
                {this.props.filters.map((filter, index) =>
                    <FilterComponent
                        key={index}
                        filter={filter}
                        index={index}
                        editable={this.props.editable}
                        onRemove={this.removeFilter}
                        onChange={this.changeFilter}
                        pathKeys={this.props.measurementKeys}
                        calculateValueSuggestions={this.calculateValueSuggestions} />)}
                {this.props.editable &&
                    <AddButton size='sm'
                            color='success'
                            onClick={this.addFilter}>Add filter</AddButton>
                }
            </Wrapper>
        );
    }

    addFilter = () =>
    {
        this.props.onChange([...this.props.filters, createFilter()]);
    }
    removeFilter = (index: number) =>
    {
        this.props.onChange(remove(index, 1, this.props.filters));
    }
    changeFilter = (index: number, filter: Filter) =>
    {
        this.props.onChange(update(index, filter, this.props.filters));
    }

    // TODO: get values from server?
    calculateValueSuggestions = (filter: Filter, input: string): string[] =>
    {
        const lowerCaseInput = input.toLocaleLowerCase();
        return getValuesWithPath(this.props.measurements, filter.path).filter(k => k.toLocaleLowerCase()
            .includes(lowerCaseInput));
    }
}
