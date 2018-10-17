import chroma from 'chroma-js';
import memoizeOne from 'memoize-one';
import React, {PureComponent, RefObject} from 'react';
import {
    AxisDomain,
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
    dateFormat: string;
    chartRef?: RefObject<ReBarChart>;
    responsive: boolean;
    width?: number;
    height: number;
    fitToDomain?: boolean;
    onMeasurementsSelected(measurements: Measurement[]): void;
}

const BAR_COLORS = new ColorPalette(chroma.brewer.Set2);

export class BarChart extends PureComponent<Props>
{
    private groups = memoizeOne(
        (measurements: Measurement[], groupMode: GroupMode, xAxis: string,
         yAxes: string[], dateFormat: string) =>
            linearizeGroups(
                groupMeasurements(measurements, groupMode, xAxis, yAxes, dateFormat),
                dateFormat
            )
    );

    render()
    {
        if (this.props.responsive)
        {
            return (
                <ResponsiveContainer width='98%' height={this.props.height}>
                    {this.renderChart()}
                </ResponsiveContainer>
            );
        }
        else return this.renderChart();
    }

    renderChart = (): JSX.Element =>
    {
        const yAxes = this.props.yAxes;
        let data = this.groups(this.props.measurements, this.props.groupMode,
            this.props.xAxis, yAxes, this.props.dateFormat);

        const empty = data.length === 0;
        if (empty)
        {
            data = [{
                x: '',
                items: {},
                hasDateAxis: false,
                measurements: []
            }];
        }

        const yDomain: [AxisDomain, AxisDomain] = this.props.fitToDomain ? ['dataMin', 'auto'] : [0, 'auto'];

        return (
            <ReBarChart data={data}
                        width={this.props.width}
                        height={this.props.height}
                        ref={this.props.chartRef}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                    dataKey='x'
                    interval='preserveStartEnd'
                    height={40}
                    tick={props => <Tick {...props} />}>
                    {empty && <Label value='No data available' position='center' />}
                </XAxis>
                <YAxis domain={yDomain} />
                {!empty && <Tooltip wrapperStyle={{ zIndex: 999 }}
                                    offset={50}
                                    content={<BarTooltip xAxis={this.props.xAxis} />} />}
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
        );
    }

    handleBarClick = (data: {payload: MeasurementGroup}) =>
    {
        this.props.onMeasurementsSelected(data.payload.measurements);
    }
}
