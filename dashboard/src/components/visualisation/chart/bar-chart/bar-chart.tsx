import React, {PureComponent} from 'react';
import {Measurement} from '../../../../lib/measurement/measurement';
import {Bar, BarChart as ReBarChart, CartesianGrid, Label,
    Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {groupMeasurements, linearizeGroups, MeasurementGroup} from '../chart-utils';
import {ColorPalette} from '../../color-palette';
import {formatKey} from '../../../../util/measurement';
import {Tick} from '../tick';

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
        const filledYAxes = this.props.yAxes.filter(axis => axis.length > 0);
        if (this.props.measurements.length === 0 || !this.props.xAxis || filledYAxes.length === 0)
        {
            return 'No data available';
        }

        const data = linearizeGroups(
            groupMeasurements(this.props.measurements, this.props.groupMode, this.props.xAxis, filledYAxes)
        );

        const height = 400;
        return (
            <ResponsiveContainer width='98%' height={height}>
                <ReBarChart data={data}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        dataKey='x'
                        height={40}
                        tick={props => <Tick {...props} />}>
                        <Label value={this.props.xAxis} position='bottom' />
                    </XAxis>
                    <YAxis />
                    <Tooltip />
                    <Legend align='right' />
                    {filledYAxes.map((axis, index) =>
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
    renderLabel = (data: MeasurementGroup[], props: {}, axis: string): string =>
    {
        return data[props['index']].items[axis].average.toFixed(2).toString();
    }

    handleBarClick = (data: {payload: MeasurementGroup}) =>
    {
        this.props.onMeasurementsSelected(data.payload.measurements);
    }
}
