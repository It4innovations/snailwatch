import React, {PureComponent} from 'react';
import {
    CartesianGrid, ErrorBar, Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, TooltipProps,
    XAxis, YAxis
} from 'recharts';
import {hashMeasurement, Measurement} from '../../../../lib/measurement/measurement';
import {View} from '../../../../lib/view/view';
import {groupBy, values, sum, reduce, min, max} from 'ramda';
import ellipsize from 'ellipsize';
import {sort} from 'ramda';
import {Moment} from 'moment';
import {PointTooltip} from './point-tooltip';
import {DataPoint} from './data-point';
import {compareDate} from '../../../../util/date';
import {getValueWithPath} from '../../../../util/object';
import {Alert} from 'reactstrap';

interface Props
{
    measurements: Measurement[];
    view: View;
    groupByEnvironment: boolean;
}

interface State
{
    errors: string[];
}

const DATE_FORMAT = 'DD. MM. YYYY HH:mm:ss';

export class LineChart extends PureComponent<Props, State>
{
    state: State = {
        errors: []
    };

    componentWillReceiveProps(props: Props)
    {
        if (props.measurements !== this.props.measurements ||
            props.view !== this.props.view)
        {
            const errors = this.checkViewValidity(props.measurements, props.view);
            this.setState(() => ({
                errors
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
                <Alert color='danger' isOpen={this.state.errors.length > 0}>
                    {this.state.errors.map((error, index) => <div key={index}>{error}</div>)}
                </Alert>
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
        return <PointTooltip {...props} groupByEnvironment={this.props.groupByEnvironment} />;
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
        return sort((a, b) => compareDate(a.measurements[0].timestamp, b.measurements[0].timestamp), points);
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
            return (value as {} as Moment).format(DATE_FORMAT);
        }
        return value;
    }

    checkViewValidity = (measurements: Measurement[], view: View): string[] =>
    {
        const errors = [];
        const invalidX = measurements.filter(m => !this.isAxisXValid(getValueWithPath(m, view.projection.xAxis)));
        if (invalidX.length > 0)
        {
            errors.push(
                `${invalidX.length} measurements were left out because of x projection: ${view.projection.xAxis}`);
        }

        const invalidY = measurements.filter(m => !this.isAxisYValid(getValueWithPath(m, view.projection.yAxis)));
        if (invalidY.length > 0)
        {
            errors.push(
                `${invalidY.length} measurements were left out because of y projection: ${view.projection.yAxis}`);
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
