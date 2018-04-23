import React, {PureComponent} from 'react';
import {
    CartesianGrid, Tooltip, XAxis,
    YAxis, Legend, LineChart as ReLineChart, Line, ErrorBar, ResponsiveContainer
} from 'recharts';
import {Measurement} from '../../../../lib/measurement/measurement';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import { groupMeasurements, createLinePoints} from '../chart-utils';
import {ColorPalette} from '../../color-palette';
import {NamedLineChartDataset} from './line-chart-dataset';
import {Tick} from '../tick';
import {PointTooltip} from './point-tooltip';
import {LinePoint} from './line-point';
import {LineLegend} from './line-legend';

interface Props
{
    datasets: NamedLineChartDataset[];
    xAxis: string;
    width?: number;
    height: number;
    responsive?: boolean;
    groupMode: GroupMode;
    connectPoints: boolean;
    showDeviation: boolean;
    preview?: boolean;
    onMeasurementsSelected(measurements: Measurement[]): void;
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

        const padding = 20;
        const datasets = this.props.datasets.map(v =>
            groupMeasurements(v.measurements, this.props.groupMode, this.props.xAxis, [v.yAxis])
        );
        const points = createLinePoints(datasets);

        return (
            <ReLineChart data={points} width={this.props.width} height={this.props.height}>
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
                        dot={preview || !this.props.connectPoints}
                        activeDot={{
                            onClick: (data: {payload: LinePoint}) => !preview && this.selectMeasurements(data, index)
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
