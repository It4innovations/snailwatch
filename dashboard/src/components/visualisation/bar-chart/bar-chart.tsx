import React, {PureComponent} from 'react';
import {Measurement} from '../../../lib/measurement/measurement';
import {Bar, BarChart as ReBarChart, CartesianGrid, Label,
    Legend, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import {GroupMode} from '../../../lib/measurement/group-mode';
import {groupMeasurements, MeasurementGroup} from '../../../lib/measurement/measurement-grouper';
import {ColorPalette} from '../color-palette';
import {sort} from 'ramda';
import {formatKey} from '../../../util/measurement';

interface Props
{
    measurements: Measurement[];
    xAxis: string;
    yAxes: string[];
    groupMode: GroupMode;
    onMeasurementsSelected(measurements: Measurement[]): void;
}

interface TickProps
{
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    textAnchor: string;
    payload: {
        value: string;
    };
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

        const data = sort((a, b) => a.x.localeCompare(b.x),
            groupMeasurements(this.props.measurements, this.props.groupMode,
                this.props.xAxis, filledYAxes));

        return (
            <ResponsiveContainer width='98%' height={400}>
                <ReBarChart data={data}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                        dataKey='x'
                        height={40}
                        tick={this.renderTick}>
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
    renderTick = (props: TickProps): JSX.Element =>
    {
        const value = props.payload.value;
        const formatted = this.formatX(value);
        return (
            <g>
                <text width={props.width} height={props.height} x={props.x} y={props.y} fill={props.fill}
                      textAnchor={props.textAnchor}>
                    <tspan x={props.x} dy='0.71em'>{formatted}</tspan>
                </text>
                <title>{value}</title>
            </g>
         );
    }
    renderLabel = (data: MeasurementGroup[], props: {}, axis: string): string =>
    {
        return data[props['index']].items[axis].average.toFixed(2).toString();
    }

    formatX = (value: string): string =>
    {
        return value;
    }

    handleBarClick = (data: {payload: MeasurementGroup}) =>
    {
        this.props.onMeasurementsSelected(data.payload.measurements);
    }
}
