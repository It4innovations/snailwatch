import React, {PureComponent} from 'react';
import {RangeFilter} from '../../lib/measurement/selection/range-filter';
import {Moment, default as moment} from 'moment';
import Input from 'reactstrap/lib/Input';
import {Switch} from '../global/switch';

interface Props
{
    rangeFilter: RangeFilter;
    onFilterChange(filter: RangeFilter): void;
}

export class RangeFilterSwitcher extends PureComponent<Props>
{
    render()
    {
        return (
            <>
                <Switch
                    useFirst={!this.props.rangeFilter.useDateFilter}
                    firstLabel={'Last N entries'}
                    secondLabel={'Date'}
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
                <span>From</span>
                <Input type='date'
                       max={to}
                       value={from}
                       onChange={e => this.changeDate(moment(e.currentTarget.value), this.props.rangeFilter.to)} />
                <span>To</span>
                <Input type='date'
                       value={to}
                       min={from}
                       onChange={e => this.changeDate(this.props.rangeFilter.from, moment(e.currentTarget.value))} />
            </div>
        );
    }
    renderRange = (): JSX.Element =>
    {
        return (
            <Input type='select'
                   bsSize='sm'
                   value={this.props.rangeFilter.entryCount}
                   onChange={this.changeRange}>
                <option value={10}>10</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
            </Input>
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
