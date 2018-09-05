import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import styled from 'styled-components';
import {GridChartSortMode} from './grid-chart-sort-mode';

interface Props
{
    query: string;
    sortMode: GridChartSortMode;
    onChangeQuery(query: string): void;
    onChangeSortMode(sortMode: GridChartSortMode): void;
}

const Wrapper = styled.div`
  margin-bottom: 5px;
  :last-child {
    margin-bottom: 0;
  }
`;
const Label = styled.div`
  font-size: 1.25rem;
`;

export class GridChartPageFilter extends PureComponent<Props>
{
    render()
    {
        return (
            <>
                <Wrapper>
                    <Label>Filter</Label>
                    <Input value={this.props.query}
                           onChange={this.changeQuery}
                           bsSize='sm'
                           placeholder='Use regex to filter views' />
                </Wrapper>
                <Wrapper>
                    <Label>Sort by</Label>
                    <Input type='select'
                           bsSize='sm'
                           value={this.props.sortMode}
                           onChange={this.changeSortMode}>
                        <option value={GridChartSortMode.CreationTime}>Creation time</option>
                        <option value={GridChartSortMode.Name}>View name</option>
                    </Input>
                </Wrapper>
            </>
        );
    }

    changeQuery = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.props.onChangeQuery(event.currentTarget.value);
    }
    changeSortMode = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.props.onChangeSortMode(Number(event.currentTarget.value) as GridChartSortMode);
    }
}
