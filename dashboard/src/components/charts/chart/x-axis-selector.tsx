import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import {Project} from '../../../lib/project/project';
import {MeasurementKeys} from '../../global/keys/measurement-keys';
import {DATE_FORMAT_DAY, DATE_FORMAT_HOUR, DATE_FORMAT_MONTH, DateFormat} from './date-format';

interface Props
{
    project: Project;
    xAxis: string;
    dateFormat: DateFormat;
    onChangeXAxis(xAxis: string): void;
    onChangeDateFormat(dateFormat: DateFormat): void;
}

export class XAxisSelector extends PureComponent<Props>
{
    render()
    {
        return (
            <>
                <MeasurementKeys project={this.props.project}
                                 value={this.props.xAxis}
                                 onChange={this.props.onChangeXAxis} />
                {this.props.xAxis === 'timestamp' &&
                    <div>
                        Group by:
                        <Input type='select'
                               bsSize='sm'
                               value={this.props.dateFormat}
                               onChange={this.changeDateFormat}>
                            <option value={DATE_FORMAT_MONTH}>Month</option>
                            <option value={DATE_FORMAT_DAY}>Day</option>
                            <option value={DATE_FORMAT_HOUR}>Hour</option>
                        </Input>
                    </div>
                }
            </>
        );
    }

    changeDateFormat = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        this.props.onChangeDateFormat(e.currentTarget.value as DateFormat);
    }
}
