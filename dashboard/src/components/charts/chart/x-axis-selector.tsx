import {sort} from 'ramda';
import React, {PureComponent} from 'react';
import {MeasurementKeys} from '../../global/keys/measurement-keys';

interface Props
{
    measurementKeys: string[];
    xAxis: string;
    onChange(xAxis: string): void;
}

export class XAxisSelector extends PureComponent<Props>
{
    render()
    {
        const keys = sort((a, b) => a.localeCompare(b), this.props.measurementKeys);
        return <MeasurementKeys keys={keys}
                     value={this.props.xAxis}
                     onChange={this.props.onChange} />;
    }
}
