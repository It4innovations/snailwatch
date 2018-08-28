import React, {PureComponent} from 'react';
import {
    Bar,
    BarChart as ReBarChart,
    CartesianGrid,
    Label,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {formatKey} from '../../../../util/measurement';
import {ColorPalette} from '../../color-palette';
import {groupMeasurements, linearizeGroups, MeasurementGroup} from '../chart-utils';
import {Tick} from '../tick';
import {BarTooltip} from './bar-tooltip';

interface Props
{
    measurements: Measurement[];
    xAxis: string;
    yAxes: string[];
    groupMode: GroupMode;
    onMeasurementsSelected(measurements: Measurement[]): void;
}

const BAR_COLORS = new ColorPalette([
    '#8884D8',
    '#DD5522',
    '#118844',
    '#02EECC'
]);

export class BarChart extends PureComponent<Props>
{
    render()
    {
        const yAxes = this.props.yAxes;
        const grouped = groupMeasurements(this.props.measurements, this.props.groupMode, this.props.xAxis, yAxes);
        const data = linearizeGroups(grouped);

        const height = 400;
        return (
            <ResponsiveContainer width='98%' height={height}>
                <ReBarChart data={data} margin={{left: 20}}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        dataKey='x'
                        height={40}
                        tick={props => <Tick {...props} />}>
                        <Label value={this.props.xAxis} position='bottom' />
                    </XAxis>
                    <YAxis />
                    <Tooltip content={<BarTooltip xAxis={this.props.xAxis} />} />
                    <Legend align='right' />
                    {yAxes.map((axis, index) =>
                        <Bar key={`${axis}.${index}`}
                             isAnimationActive={false}
                             dataKey={`items["${axis}"].average`}
                             stackId='0'
                             onClick={this.handleBarClick}
                             maxBarSize={60}
                             name={formatKey(axis)}
                             fill={BAR_COLORS.getColor(index)} />
                    )}
                </ReBarChart>
            </ResponsiveContainer>
        );
    }

    handleBarClick = (data: {payload: MeasurementGroup}) =>
    {
        this.props.onMeasurementsSelected(data.payload.measurements);
    }
}
