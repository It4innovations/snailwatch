import React, {PureComponent} from 'react';
import {
    CartesianGrid, ErrorBar, Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, TooltipProps, XAxis,
    YAxis
} from 'recharts';
import {hashMeasurement, Measurement} from '../../../../lib/measurement/measurement';
import {View} from '../../../../lib/view/view';
import {groupBy, values, sum, reduce, min, max} from 'ramda';
import {getValueWithPath} from '../../../../lib/view/filter';

interface Props
{
    measurements: Measurement[];
    view: View;
}

interface DataPoint
{
    x: string | number;
    y: number;
    deviation: number[];
}


export class LineChart extends PureComponent<Props>
{
    render()
    {
        const measurements = this.generateData(this.props.measurements, this.props.view);
        const margin = 20;
        const horizontalPadding = 20;
        const verticalPadding = 20;

        return (
            <ResponsiveContainer width='100%' height={400}>
                <ReLineChart width={400}
                             data={measurements}
                             margin={{ top: margin, right: margin, left: margin, bottom: margin }}>
                    <CartesianGrid stroke='#ccc' />
                    <XAxis padding={{ left: horizontalPadding, right: horizontalPadding }} dataKey='x' />
                    <YAxis padding={{ bottom: verticalPadding, top: verticalPadding }} />
                    <Tooltip content={this.renderTooltip} />
                    <Line isAnimationActive={false} type='monotone'
                          dataKey='y'
                          stroke='#8884d8'>
                        <ErrorBar dataKey='deviation' stroke='red' strokeWidth={4} />
                    </Line>
                </ReLineChart>
            </ResponsiveContainer>
        );
    }

    renderTooltip = (props: TooltipProps): JSX.Element =>
    {
        if (props.payload === null ||
            props.payload === undefined ||
            props.payload.length < 1) return null;

        const point = (props.payload[0] as {} as {payload: DataPoint}).payload;

        return (
            <div>
                <div>Label: {point.x.toString()}</div>
                <div>Avg: {point.y}</div>
                <div>Deviation: [{point.deviation[0]}, {point.deviation[1]}]</div>
            </div>
        );
    }

    generateData = (measurements: Measurement[], view: View): DataPoint[] =>
    {
        const groups = groupBy(hashMeasurement, measurements);
        return values(groups)
            .map(group => {
                const x = getValueWithPath(group[0], view.projection.xAxis);
                const yValues = group.map(value => Number(getValueWithPath(value, view.projection.yAxis)));
                const avg = sum(yValues) / yValues.length;
                const range = [
                    avg - reduce(min, yValues[0], yValues),
                    reduce(max, yValues[0], yValues) - avg
                ];

                return {
                    x: x,
                    y: avg,
                    deviation: range
                };
            });
    }
}
