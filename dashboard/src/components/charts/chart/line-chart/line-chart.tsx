import {chain} from 'ramda';
import React, {PureComponent} from 'react';
import {
    CartesianGrid,
    ErrorBar,
    Legend,
    Line,
    LineChart as ReLineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {Measurement} from '../../../../lib/measurement/measurement';
import {ColorPalette} from '../../color-palette';
import {createLinePoints, groupMeasurements} from '../chart-utils';
import {Tick} from '../tick';
import {LineLegend} from './line-legend';
import {LinePoint} from './line-point';
import {PointTooltip} from './point-tooltip';

export interface LineChartDataset
{
    name: string;
    yAxis: string;
    measurements: Measurement[];
}

interface Props
{
    datasets: LineChartDataset[];
    xAxis: string;
    width?: number;
    height: number;
    responsive?: boolean;
    groupMode: GroupMode;
    connectPoints: boolean;
    showPoints: boolean;
    showDeviation: boolean;
    preview?: boolean;
    onMeasurementsSelected?(measurements: Measurement[]): void;
}

const DATASET_COLORS = new ColorPalette([
    '#DD551D',
    '#A14CDD',
    '#DD2288',
    '#46DDA6'
]);

export class LineChart extends PureComponent<Props>
{
    render()
    {
        if (this.props.datasets.length > 1 && this.props.groupMode === GroupMode.None)
        {
            return 'You have to use a group mode with multiple datasets';
        }

        if (chain(d => d.measurements, this.props.datasets).length === 0)
        {
            return 'No data available';
        }

        if (this.props.responsive)
        {
            return (
                <ResponsiveContainer height={this.props.height}>
                    {this.renderChart()}
                </ResponsiveContainer>
            );
        }

        return this.renderChart();
    }
    renderChart = (): JSX.Element =>
    {
        const preview = this.props.preview || false;

        const padding = preview ? 0 : 20;
        const datasets = this.props.datasets.map(v =>
            groupMeasurements(v.measurements, this.props.groupMode, this.props.xAxis, [v.yAxis])
        );
        const points = createLinePoints(datasets);
        const dotActive = this.selectMeasurements && !preview;

        return (
            <ReLineChart data={points}
                         width={this.props.width}
                         height={this.props.height}
                         margin={{left: 20}}>
                <CartesianGrid stroke='#CCCCCC' />
                <XAxis
                    dataKey='x'
                    tickLine={!preview}
                    tick={props => !this.props.preview && <Tick {...props} />}
                    padding={{left: padding, right: padding}} />
                <YAxis padding={{bottom: padding, top: padding}} />
                {!preview && <Tooltip content={<PointTooltip xAxis={this.props.xAxis} />} />}
                {!preview && <Legend content={<LineLegend palette={DATASET_COLORS} />} />}
                {datasets.map((scatter, index) =>
                    <Line
                        key={`line.${index}`}
                        name={this.props.datasets[index].name}
                        isAnimationActive={false}
                        dataKey={`data[${index}].value`}
                        connectNulls={true}
                        dot={this.props.showPoints}
                        activeDot={dotActive && {
                            onClick: (data: {payload: LinePoint}) => this.selectMeasurements(data, index)
                        }}
                        stroke={(this.props.connectPoints ? DATASET_COLORS.getColor(index) : '#00000000')}
                        fill={DATASET_COLORS.getColor(index)}>
                        {(!preview && this.props.showDeviation) &&
                        <ErrorBar
                            dataKey={`data[${index}].deviation`}
                            stroke={DATASET_COLORS.getColor(index)}
                            strokeWidth={2} />
                        }
                    </Line>
                )}
            </ReLineChart>
        );
    }

    selectMeasurements = (data: {payload: LinePoint}, index: number) =>
    {
        this.props.onMeasurementsSelected(data.payload.data[index].group.measurements);
    }
}
