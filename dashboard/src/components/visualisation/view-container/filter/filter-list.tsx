import React, {PureComponent} from 'react';
import {createFilter, Filter} from '../../../../lib/view/filter';
import {FilterComponent} from './filter-component';
import {Button} from 'reactstrap';
import {update, remove} from 'ramda';
import {Measurement} from '../../../../lib/measurement/measurement';
import {getValuesWithPath} from '../../../../util/object';

interface Props
{
    filters: Filter[];
    editable: boolean;
    measurementKeys: string[];
    measurements: Measurement[];
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
                        onChange={this.changeFilter}
                        calculatePathSuggestions={this.calculatePathSuggestions}
                        calculateValueSuggestions={this.calculateValueSuggestions} />)}
                {this.props.editable && <Button onClick={this.addFilter}>Add filter</Button>}
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

    calculatePathSuggestions = (input: string): string[] =>
    {
        const suggestions = this.props.measurementKeys.filter(k => k.includes(input));
        suggestions.sort();
        return suggestions;
    }
    // TODO: get values from server?
    calculateValueSuggestions = (filter: Filter, input: string): string[] =>
    {
        return getValuesWithPath(this.props.measurements, filter.path).filter(k => k.includes(input));
    }
}
