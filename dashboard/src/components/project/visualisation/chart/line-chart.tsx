import React, {PureComponent} from 'react';
import {
    CartesianGrid, ErrorBar, Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, TooltipProps,
    XAxis, YAxis
} from 'recharts';
import {hashMeasurement, Measurement} from '../../../../lib/measurement/measurement';
import {View} from '../../../../lib/view/view';
import {groupBy, values, sum, reduce, min, max, all} from 'ramda';
import {getValueWithPath} from '../../../../lib/view/filter';
import ellipsize from 'ellipsize';
import {sort} from 'ramda';
import {Moment} from 'moment';
import styled from 'styled-components';

interface Props
{
    measurements: Measurement[];
    view: View;
    groupByEnvironment: boolean;
}

interface State
{
    error: string;
}

interface DataPoint
{
    x: string;
    y: number;
    deviation: number[];
    measurements: Measurement[];
}

const TooltipWrapper = styled.div`
  background: rgba(180, 180, 180, 0.5);
  padding: 5px;
`;

export class LineChart extends PureComponent<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state = {
            error: ''
        };
    }

    componentWillReceiveProps(props: Props)
    {
        if (props.measurements !== this.props.measurements ||
            props.view !== this.props.view)
        {
            const errors = this.checkViewValidity(props.measurements, props.view);
            this.setState(() => ({
                error: errors.join(' ')
            }));
        }
    }

    render()
    {
        const measurements = this.generateData(
            this.getValidMeasurements(this.props.measurements, this.props.view),
            this.props.view
        );
        const margin = 20;
        const horizontalPadding = 20;
        const verticalPadding = 20;

        return (
            <>
                {this.state.error && <div>{this.state.error}</div>}
                <ResponsiveContainer width='100%' height={400}>
                    <ReLineChart width={400}
                                 data={measurements}
                                 margin={{top: margin, right: margin, left: margin, bottom: margin}}>
                        <CartesianGrid stroke='#ccc' />
                        <XAxis
                            padding={{left: horizontalPadding, right: horizontalPadding}}
                            dataKey='x'
                            tickFormatter={this.formatX} />
                        <YAxis padding={{bottom: verticalPadding, top: verticalPadding}} />
                        <Tooltip content={this.renderTooltip} />
                        <Line isAnimationActive={false} type='linear'
                              dataKey='y'
                              stroke='#8884d8'>
                            {this.props.groupByEnvironment &&
                            <ErrorBar dataKey='deviation' stroke='red' strokeWidth={4} />}
                        </Line>
                    </ReLineChart>
                </ResponsiveContainer>
            </>
        );
    }

    renderTooltip = (props: TooltipProps): JSX.Element =>
    {
        if (props.payload === null ||
            props.payload === undefined ||
            props.payload.length < 1) return null;

        const point = (props.payload[0] as {} as {payload: DataPoint}).payload;
        const content = this.props.groupByEnvironment ?
            <>
                <div>Avg: {point.y}</div>
                <div>Deviation: [{point.deviation[0]}, {point.deviation[1]}]</div>
            </> :
            <div>Value: {point.y}</div>;
        return (
            <TooltipWrapper>
                <div>Label: {point.x.toString()}</div>
                {content}
            </TooltipWrapper>
        );
    }
    formatX = (value: string): string =>
    {
        return ellipsize(value, 18);
    }

    getValidMeasurements(measurements: Measurement[], view: View): Measurement[]
    {
        return measurements.filter(m =>
            this.isAxisXValid(getValueWithPath(m, view.projection.xAxis)) &&
            this.isAxisYValid(getValueWithPath(m, view.projection.yAxis))
        );
    }

    generateData = (measurements: Measurement[], view: View): DataPoint[] =>
    {
        const points = this.generatePoints(measurements, view);
        return sort((a, b) => {
            const before = !a.measurements[0].timestamp.isAfter(b.measurements[0].timestamp);
            return before ? -1 : 1;
        }, points);
    }
    generatePoints = (measurements: Measurement[], view: View): DataPoint[] =>
    {
        if (this.props.groupByEnvironment)
        {
            const groups = groupBy(hashMeasurement, measurements);
            return values(groups)
                .map(group => {
                    const x = this.getXValue(group, view);
                    const yValues: number[] = group.map(value =>
                        Number(getValueWithPath(value, view.projection.yAxis)));
                    const avg = sum(yValues) / yValues.length;
                    const range = [
                        avg - (reduce(min, yValues[0], yValues) as number),
                        (reduce(max, yValues[0], yValues) as number) - avg
                    ];

                    return {
                        x: x.toString(),
                        y: avg,
                        deviation: range,
                        measurements: group
                    };
                });
        }
        else return measurements.map(m => ({
            x: this.getXValue([m], view).toString(),
            y: Number(getValueWithPath(m, view.projection.yAxis)),
            deviation: [],
            measurements: [m]
        }));
    }
    getXValue = (group: Measurement[], view: View): string =>
    {
        const value = getValueWithPath(group[0], view.projection.xAxis);
        if (view.projection.xAxis === 'timestamp')
        {
            return (value as {} as Moment).format('DD. MM. YYYY HH:mm:ss');
        }
        return value;
    }

    checkViewValidity = (measurements: Measurement[], view: View): string[] =>
    {
        const errors = [];
        if (!all(m => this.isAxisXValid(getValueWithPath(m, view.projection.xAxis)), measurements))
        {
            errors.push(
                `Some measurements were left out because of x projection: ${view.projection.xAxis}`);
        }
        if (!all(m => this.isAxisYValid(getValueWithPath(m, view.projection.yAxis)), measurements))
        {
            errors.push(
                `Some measurements were left out because of y projection: ${view.projection.yAxis}`);
        }

        return errors;
    }

    isAxisXValid = (value: {}): boolean =>
    {
        return value !== undefined;
    }
    isAxisYValid = (value: {}): boolean =>
    {
        return value !== undefined &&
            value !== '' &&
            !isNaN(Number(value));
    }
}
