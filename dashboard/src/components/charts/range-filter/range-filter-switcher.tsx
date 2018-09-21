import moment, {Moment} from 'moment';
import React, {PureComponent} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {formatDate, parseDate} from 'react-day-picker/moment';
import {Input} from 'reactstrap';
import styled from 'styled-components';
import {RangeFilter} from '../../../lib/view/range-filter';
import {Switch} from '../../global/switch';
import './range-filter-switcher.scss';

interface Props
{
    rangeFilter: RangeFilter;
    onFilterChange(filter: RangeFilter): void;
}

const RangeInput = styled(Input)`
  width: 80px !important;
`;
const Wrapper = styled.div`
  display: flex;
  align-items: center;

  input {
    width: 100px;
    text-align: center;
    padding: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    border: 1px solid #CED4DA;
    border-radius: 5px;
  }
`;
const InputWrapper = styled.div<{left?: boolean}>`
  input {
    ${props => props.left ? 'border-radius: 5px 0 0 5px' : 'border-radius: 0 5px 5px 0'};
  }
`;

const rangeSizes = [100, 250, 500, 1000];

export class RangeFilterSwitcher extends PureComponent<Props>
{
    private to: React.RefObject<DayPickerInput> = React.createRef();

    render()
    {
        return (
            <>
                <Switch
                    useFirst={this.props.rangeFilter.useDateFilter}
                    firstLabel='Date'
                    secondLabel='Last N'
                    firstComponent={this.renderDate()}
                    secondComponent={this.renderRange()}
                    onChange={this.changeRangeType} />
            </>
        );
    }
    renderDate = (): JSX.Element =>
    {
        const from = this.props.rangeFilter.from.toDate();
        const to = this.props.rangeFilter.to.toDate();

        const modifiers = { start: from, end: to };

        return (
            <Wrapper>
                <InputWrapper left>
                    <DayPickerInput
                        value={from}
                        placeholder='From'
                        format='DD. MM. YYYY'
                        formatDate={formatDate}
                        parseDate={parseDate}
                        dayPickerProps={{
                            selectedDays: [from, { from, to }],
                            disabledDays: { after: to },
                            toMonth: to,
                            modifiers,
                            onDayClick: () => this.to.current.getInput().focus()
                        }}
                        onDayChange={this.changeFromDate} />
                </InputWrapper>
                <InputWrapper>
                    <DayPickerInput
                        ref={this.to}
                        value={to}
                        placeholder='To'
                        format='DD. MM. YYYY'
                        formatDate={formatDate}
                        parseDate={parseDate}
                        dayPickerProps={{
                            selectedDays: [from, { from, to }],
                            disabledDays: { before: from },
                            modifiers,
                            month: from,
                            fromMonth: from,
                        }}
                        onDayChange={this.changeToDate} />
                </InputWrapper>
            </Wrapper>
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
    changeFromDate = (date: Date) =>
    {
        this.changeDate(moment(date), this.props.rangeFilter.to);
    }
    changeToDate = (date: Date) =>
    {
        this.changeDate(this.props.rangeFilter.from, moment(date));
    }
    changeRangeType = (useRange: boolean) =>
    {
        this.props.onFilterChange({
            ...this.props.rangeFilter,
            useDateFilter: !useRange
        });
    }
}
