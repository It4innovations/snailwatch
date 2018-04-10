import React, {PureComponent} from 'react';
import {createFilter, Filter} from '../../../../lib/measurement/selection/filter';
import {FilterComponent} from './filter-component';
import {Button} from 'reactstrap';
import {update, remove} from 'ramda';
import {Measurement} from '../../../../lib/measurement/measurement';
import {getValuesWithPath} from '../../../../util/object';
import styled from 'styled-components';

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
