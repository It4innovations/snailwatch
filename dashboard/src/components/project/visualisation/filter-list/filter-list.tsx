import React, {PureComponent} from 'react';
import {createFilter, Filter} from '../../../../lib/filter/filter';
import {FilterComponent} from './filter-component';
import {Button} from 'react-bootstrap';
import {update, remove} from 'ramda';
import uuid from 'uuid/v4';

interface Props
{
    filters: Filter[];
    onFiltersChange(filters: Filter[]): void;
}


export class FilterList extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                {this.props.filters.map((filter, index) =>
                    <FilterComponent
                        key={filter.id}
                        filter={filter}
                        onRemove={() => this.removeFilter(index)}
                        onChange={f => this.changeFilter(index, f)} />)}
                <Button bsStyle='success' onClick={this.addFilter}>Add filter</Button>
            </div>
        );
    }

    addFilter = () =>
    {
        this.props.onFiltersChange([...this.props.filters, createFilter(uuid())]);
    }
    removeFilter = (index: number) =>
    {
        this.props.onFiltersChange(remove(index, 1, this.props.filters));
    }
    changeFilter = (index: number, filter: Filter) =>
    {
        this.props.onFiltersChange(update(index, filter, this.props.filters));
    }
}
