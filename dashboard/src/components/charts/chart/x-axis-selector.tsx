import React, {PureComponent} from 'react';
import {Input} from 'reactstrap';
import {Project} from '../../../lib/project/project';
import {MeasurementKeys} from '../../global/keys/measurement-keys';
import {DATE_FORMAT_DAY, DATE_FORMAT_HOUR, DATE_FORMAT_MONTH, DateFormat} from './date-format';
import {XAxisSettings} from './x-axis-settings';

interface Props
{
    project: Project;
    settings: XAxisSettings;
    onChange(settings: XAxisSettings): void;
}

export class XAxisSelector extends PureComponent<Props>
{
    render()
    {
        return (
            <>
                <MeasurementKeys project={this.props.project}
                                 value={this.props.settings.xAxis}
                                 onChange={this.changeXAxis} />
                {this.props.settings.xAxis === 'timestamp' &&
                    <div>
                        Group by:
                        <Input type='select'
                               bsSize='sm'
                               value={this.props.settings.dateFormat}
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
        this.props.onChange({
            ...this.props.settings,
            dateFormat: e.currentTarget.value as DateFormat
        });
    }

    changeXAxis = (xAxis: string) =>
    {
        this.props.onChange({
            ...this.props.settings,
            xAxis
        });
    }
}
