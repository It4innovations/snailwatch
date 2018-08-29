import {default as moment, Moment} from 'moment';
import React, {PureComponent} from 'react';
import Input from 'reactstrap/lib/Input';
import InputGroup from 'reactstrap/lib/InputGroup';
import InputGroupAddon from 'reactstrap/lib/InputGroupAddon';
import InputGroupText from 'reactstrap/lib/InputGroupText';
import styled from 'styled-components';
import {RangeFilter} from '../../lib/view/range-filter';
import {Switch} from '../global/switch';

interface Props
{
    rangeFilter: RangeFilter;
    onFilterChange(filter: RangeFilter): void;
}

const RangeInput = styled(Input)`
  width: 80px !important;
`;
const DateLabel = styled(InputGroupText)`
  width: 50px;
  justify-content: center;
`;

const rangeSizes = [100, 250, 500, 1000];

export class RangeFilterSwitcher extends PureComponent<Props>
{
    render()
    {
        return (
            <>
                <Switch
                    useFirst={!this.props.rangeFilter.useDateFilter}
                    firstLabel='Last N'
                    secondLabel='Date'
                    firstComponent={this.renderRange()}
                    secondComponent={this.renderDate()}
                    onChange={this.changeRangeType} />
            </>
        );
    }
    renderDate = (): JSX.Element =>
    {
        const dateFormat = 'YYYY-MM-DD';

        const from = this.props.rangeFilter.from.format(dateFormat);
        const to = this.props.rangeFilter.to.format(dateFormat);

        return (
            <div>
                <InputGroup size='sm'>
                    <InputGroupAddon addonType='prepend'>
                        <DateLabel>From</DateLabel>
                    </InputGroupAddon>
                    <Input bsSize='sm'
                           type='date'
                           max={to}
                           value={from}
                           onChange={e => this.changeDate(moment(e.currentTarget.value), this.props.rangeFilter.to)} />
                </InputGroup>
                <InputGroup size='sm'>
                    <InputGroupAddon addonType='prepend'>
                        <DateLabel>To</DateLabel>
                    </InputGroupAddon>
                    <Input bsSize='sm'
                           type='date'
                           value={to}
                           min={from}
                           max={moment().format(dateFormat)}
                           onChange={e =>
                               this.changeDate(this.props.rangeFilter.from, moment(e.currentTarget.value))
                           } />
                </InputGroup>
            </div>
        );
    }
    renderRange = (): JSX.Element =>
    {
        return (
            <RangeInput type='select'
                   bsSize='sm'
                   value={this.props.rangeFilter.entryCount}
                   onChange={this.changeRange}>
                {rangeSizes.map(r => <option key={r} value={r}>{r}</option>)}
            </RangeInput>
        );
    }

    changeRange = (e: React.SyntheticEvent<HTMLInputElement>) =>
    {
        this.props.onFilterChange({
            ...this.props.rangeFilter,
            entryCount: Number(e.currentTarget.value)
        });
    }
    changeDate = (from: Moment, to: Moment) =>
    {
        this.props.onFilterChange({
            ...this.props.rangeFilter,
            from,
            to
        });
    }
    changeRangeType = (useRange: boolean) =>
    {
        this.props.onFilterChange({
            ...this.props.rangeFilter,
            useDateFilter: !useRange
        });
    }
}
