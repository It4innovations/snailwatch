import React, {PureComponent} from 'react';
import {Button} from 'reactstrap';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {createFilter, Filter} from '../../../lib/view/filter';
import {getValuesWithPath} from '../../../util/object';
import {FilterComponent} from './filter-component';

interface Props
{
    filters: Filter[];
    measurementKeys: string[];
    measurements: Measurement[];
    onChange(filters: Filter[]): void;
}

const Wrapper = styled.div`
  margin-bottom: 5px;
`;
const Filter = styled(FilterComponent)`
  margin-bottom: 2px;
`;

export class FilterList extends PureComponent<Props>
{
    render()
    {
        return (
            <Wrapper>
                {this.props.filters.map(filter =>
                    <Filter
                        key={filter.id}
                        filter={filter}
                        onRemove={this.removeFilter}
                        onChange={this.changeFilter}
                        pathKeys={this.props.measurementKeys}
                        calculateValueSuggestions={this.calculateValueSuggestions} />)}
                <Button size='sm'
                        color='success'
                        onClick={this.addFilter}>Add filter</Button>
            </Wrapper>
        );
    }

    addFilter = () =>
    {
        this.props.onChange([...this.props.filters, createFilter()]);
    }
    removeFilter = (filter: Filter) =>
    {
        this.props.onChange(this.props.filters.filter(f => f.id !== filter.id));
    }
    changeFilter = (filter: Filter) =>
    {
        this.props.onChange(this.props.filters.map(f =>
            f.id === filter.id ? filter : f
        ));
    }

    // TODO: get values from server?
    calculateValueSuggestions = (filter: Filter, input: string): string[] =>
    {
        const lowerCaseInput = input.toLocaleLowerCase();
        return getValuesWithPath(this.props.measurements, filter.path).filter(k => k.toLocaleLowerCase()
            .includes(lowerCaseInput));
    }
}
