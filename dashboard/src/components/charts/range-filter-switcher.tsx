import moment, {Moment} from 'moment';
import React, {PureComponent} from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import {formatDate, parseDate} from 'react-day-picker/moment';
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
const InputWrapper = styled.div<{top: boolean}>`
  input {
    width: 120px;
    text-align: center;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5;
    border: 1px solid #CED4DA;
    ${props => props.top ? 'border-top-right-radius: 0.25rem;' : 'border-bottom-right-radius: 0.25rem;'}
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
        const from = this.props.rangeFilter.from.toDate();
        const to = this.props.rangeFilter.to.toDate();

        const modifiers = { start: from, end: to, all: () => true };
        const modifiersStyles = {
            all: {
                fontSize: '12px'
            }
        };

        return (
            <div>
                <InputGroup size='sm'>
                    <InputGroupAddon addonType='prepend'>
                        <DateLabel>From</DateLabel>
                    </InputGroupAddon>
                    <InputWrapper top>
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
                                modifiersStyles,
                                onDayClick: () => this.to.current.getInput().focus()
                            }}
                            onDayChange={this.changeFromDate} />
                    </InputWrapper>
                </InputGroup>
                <InputGroup size='sm'>
                    <InputGroupAddon addonType='prepend'>
                        <DateLabel>To</DateLabel>
                    </InputGroupAddon>
                    <InputWrapper top={false}>
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
                                modifiersStyles,
                                month: from,
                                fromMonth: from,
                            }}
                            onDayChange={this.changeToDate} />
                    </InputWrapper>
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
