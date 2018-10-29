import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import styled from 'styled-components';
import {ViewFilter, ViewSortMode} from './view-filter';

interface Props
{
    filter: ViewFilter;
    onChange(filter: ViewFilter): void;
}

const Wrapper = styled.div`
  margin-bottom: 5px;
  :last-child {
    margin-bottom: 0;
  }
`;
const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
const Label = styled.div`
  font-size: 1.25rem;
`;

export class ViewFilterComponent extends PureComponent<Props>
{
    render()
    {
        return (
            <>
                <Wrapper>
                    <Label>Filter</Label>
                    <Input value={this.props.filter.query}
                           onChange={this.changeQuery}
                           bsSize='sm'
                           placeholder='Use regex to filter views' />
                </Wrapper>
                <Wrapper>
                    <Label>Sort by</Label>
                    <Input type='select'
                           bsSize='sm'
                           value={this.props.filter.sortMode}
                           onChange={this.changeSortMode}>
                        <option value={ViewSortMode.CreationTime}>Creation time</option>
                        <option value={ViewSortMode.Name}>View name</option>
                    </Input>
                </Wrapper>
                <Row>
                    <Label>Hide empty: </Label>
                    <input type='checkbox' checked={this.props.filter.hideEmpty} onChange={this.changeHideEmpty} />
                </Row>
            </>
        );
    }

    changeQuery = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.props.onChange({
            ...this.props.filter,
            query: event.currentTarget.value
        });
    }
    changeHideEmpty = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.props.onChange({
            ...this.props.filter,
            hideEmpty: event.currentTarget.checked
        });
    }
    changeSortMode = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.props.onChange({
            ...this.props.filter,
            sortMode: Number(event.currentTarget.value) as ViewSortMode
        });
    }
}
