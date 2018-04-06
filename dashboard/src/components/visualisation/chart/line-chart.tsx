import React, {PureComponent} from 'react';
import {TooltipProps} from 'recharts';
import {hashMeasurement, Measurement} from '../../../lib/measurement/measurement';
import {Selection} from '../../../lib/measurement/selection/selection';
import {groupBy, Dictionary} from 'ramda';
import ellipsize from 'ellipsize';
import {PointTooltip} from './point-tooltip';
import {GroupMode} from '../../../lib/measurement/group-mode';



export interface LineChartView
{
    yAxis: string;
    measurements: Measurement[];
}

interface Props
{
    views: LineChartView[];
    xAxis: string;
    groupMode: GroupMode;
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
        /*if (props.selections !== this.props.selections ||
            props.xAxis !== this.props.xAxis)
        {
            const errors = this.checkViewValidity(props.measurements, props.selection);
            this.setState(() => ({
                errors
            }));
        }*/
    }

    render()
    {
        return '';
        /*const measurements = this.generateData(
            this.getValidMeasurements(this.props.measurements, this.props.selection),
            this.props.selection
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
                            {this.isGrouped() &&
                            <ErrorBar dataKey='deviation' stroke='red' strokeWidth={4} />}
                        </Line>
                    </ReLineChart>
                </ResponsiveContainer>
            </>
        );*/
    }
    renderTooltip = (props: TooltipProps): JSX.Element =>
    {
        return <PointTooltip {...props} grouped={this.isGrouped()} />;
    }

    formatX = (value: string): string =>
    {
        return ellipsize(value, 18);
    }

    getValidMeasurements(measurements: Measurement[], view: Selection): Measurement[]
    {
        return [];
        /*return measurements.filter(m =>
            this.isAxisXValid(getValueWithPath(m, selection.projection.xAxis)) &&
            this.isAxisYValid(getValueWithPath(m, selection.projection.yAxis))
        );*/
    }

   /* generateData = (measurements: Measurement[], view: Selection): DataPoint[] =>
    {
        const points = this.generatePoints(measurements, view);
        return sort((a, b) => compareDate(a.measurements[0].timestamp, b.measurements[0].timestamp), points);
    }
    generatePoints = (measurements: Measurement[], view: Selection): DataPoint[] =>
    {
        if (this.isGrouped())
        {
            const groups = this.group(measurements, selection);
            return values(groups)
                .map(group => {
                    const x = this.getXValue(group[0], selection);
                    const yValues: number[] = group.map(value =>
                        Number(getValueWithPath(value, selection.projection.yAxis)));
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
            x: this.getXValue(m, selection).toString(),
            y: Number(getValueWithPath(m, selection.projection.yAxis)),
            deviation: [],
            measurements: [m]
        }));
        return [];
    }*/
    getXValue = (measurement: Measurement, view: Selection): string =>
    {
        /*const value = getValueWithPath(measurement, selection.projection.xAxis);
        if (selection.projection.xAxis === 'timestamp')
        {
            return (value as {} as Moment).format(DATE_FORMAT);
        }
        return value;*/
        return '';
    }

    group = (measurements: Measurement[], view: Selection): Dictionary<Measurement[]> =>
    {
        switch (this.props.groupMode)
        {
            case GroupMode.Benchmark:
                return groupBy(m => m.benchmark, measurements);
            case GroupMode.AxisX:
                return groupBy(m => this.getXValue(m, view), measurements);
            case GroupMode.Environment:
                return groupBy(hashMeasurement, measurements);
            default:
                return groupBy(m => m.benchmark, measurements);
        }
    }

    checkViewValidity = (measurements: Measurement[], view: Selection): string[] =>
    {
        const errors: string[] = [];
        /*const invalidX = measurements.filter(m => !this.isAxisXValid(getValueWithPath(m,
        selection.projection.xAxis)));
        selection.projection.xAxis)));
        if (invalidX.length > 0)
        {
            errors.push(
                `${invalidX.length} measurements were left out because of x projection: ${selection.projection.xAxis}`);
        }

        const invalidY = measurements.filter(m => !this.isAxisYValid(getValueWithPath(m, selection.projection.yAxis)));
        if (invalidY.length > 0)
        {
            errors.push(
                `${invalidY.length} measurements were left out because of y projection: ${selection.projection.yAxis}`);
        }*/

        return errors;
    }

    isGrouped = (): boolean =>
    {
        return this.props.groupMode !== GroupMode.None;
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
