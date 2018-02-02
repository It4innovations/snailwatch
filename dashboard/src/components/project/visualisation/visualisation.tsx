import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import {Project} from '../../../lib/project/project';
import {User} from '../../../lib/user/user';
import {FilterList} from './filter-list/filter-list';
import {Filter} from '../../../lib/filter/filter';

interface Props
{
    user: User;
    project: Project;
    measurements: Measurement[];
}

interface State
{
    filters: Filter[];
}

export class Visualisation extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            filters: []
        };
    }

    render()
    {
        return <FilterList filters={this.state.filters} onFiltersChange={filters => this.setState(() => ({
            filters
        }))} />;
    }
}
