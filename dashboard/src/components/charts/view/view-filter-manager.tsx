import React, {PureComponent} from 'react';
import styled from 'styled-components';
import {Measurement} from '../../../lib/measurement/measurement';
import {Filter} from '../../../lib/view/filter';
import {View} from '../../../lib/view/view';
import {Help} from '../../global/help';
import {FilterList} from '../filter/filter-list';

interface Props
{
    view: View;
    measurements: Measurement[];
    measurementKeys: string[];
    onChange(view: View): void;
}

const initialState = {
    viewError: ''
};

type State = Readonly<typeof initialState>;

const Row = styled.div`
    display: flex;
    align-items: center;
`;

export class ViewFilterManager extends PureComponent<Props, State>
{
    readonly state: State = initialState;

    render()
    {
        return (
            <>
                <Row>
                    <span>Filters</span>
                    <Help content='Create conditions that will be used to select a subset
                    of the measurements.' />
                </Row>
                <FilterList
                    filters={this.props.view.filters}
                    measurementKeys={this.props.measurementKeys}
                    measurements={this.props.measurements}
                    onChange={this.handleFilterChange} />
            </>
        );
    }

    handleFilterChange = (filters: Filter[]) =>
    {
        this.props.onChange({ ...this.props.view, filters });
    }
}
