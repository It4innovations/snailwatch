import React, {PureComponent} from 'react';
import {createFilter, Filter} from '../../../../../lib/view/filter';
import {FilterComponent} from './filter-component';
import {Button} from 'react-bootstrap';
import {update, remove} from 'ramda';

interface Props
{
    filters: Filter[];
    editable: boolean;
    onChange(filters: Filter[]): void;
}

export class FilterList extends PureComponent<Props>
{
    render()
    {
        return (
            <div>
                {this.props.filters.map((filter, index) =>
                    <FilterComponent
                        key={index}
                        filter={filter}
                        index={index}
                        editable={this.props.editable}
                        onRemove={this.removeFilter}
                        onChange={this.changeFilter} />)}
                {this.props.editable && <Button bsStyle='success' onClick={this.addFilter}>Add filter</Button>}
            </div>
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
}
