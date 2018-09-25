import chroma from 'chroma-js';
import React, {PureComponent} from 'react';
import {
    CartesianGrid,
    ErrorBar,
    Label,
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
import {Tick} from '../tick';
import {LineChartSettings} from './line-chart-settings';
import {LineLegend} from './line-legend';
import {LabeledGroup, LinePoint} from './line-point';
import {PointTooltip} from './point-tooltip';
import {createLineData} from './utils';


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
    settings: LineChartSettings;
    preview?: boolean;
    dateFormat: string;
    onMeasurementsSelected?(measurements: Measurement[]): void;
}

const DATASET_COLORS = new ColorPalette(chroma.brewer.Set1);

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
        const padding = preview ? 0 : 20;

        let {points, groups} = createLineData(this.props.datasets, this.props.groupMode, this.props.xAxis,
            this.props.dateFormat, this.props.settings.showAverageTrend, DATASET_COLORS
        );

        const empty = points.length === 0;
        if (empty)
        {
            points = [{x: '', data: []}];
        }

        return (
            <ReLineChart data={points}
                         width={this.props.width}
                         height={this.props.height}
                         margin={{left: 20}}>
                <CartesianGrid stroke='#CCCCCC' />
                <XAxis
                    dataKey='x'
                    interval={0}
                    tickLine={!preview}
                    tick={props => !this.props.preview && <Tick {...props} />}
                    padding={{left: padding, right: padding}}>
                    {empty && <Label value='No data available' position='center' />}
                </XAxis>
                <YAxis padding={{bottom: padding, top: padding}} />
                {!preview && <Tooltip wrapperStyle={{ zIndex: 999 }}
                                      offset={50}
                                      content={<PointTooltip xAxis={this.props.xAxis} />} />}
                {!preview && <Legend content={<LineLegend groups={groups} />} />}
                {groups.map((g, i) => this.renderLine(g, i, preview))}
            </ReLineChart>
        );
    }

    renderLine = (group: LabeledGroup, index: number, preview: boolean): JSX.Element =>
    {
        const dotActive = this.props.onMeasurementsSelected && !preview && !group.isAverageTrend;
        const showDeviation = !preview && this.props.settings.showDeviation && !group.isAverageTrend;
        const color = group.color;

        return (
            <Line
                key={`line.${index}`}
                name={group.name}
                isAnimationActive={false}
                strokeDasharray={group.isAverageTrend ? '5 5' : ''}
                legendType={group.isAverageTrend ? 'none' : 'circle'}
                type={group.isAverageTrend ? 'monotone' : 'linear'}
                dataKey={`data[${index}].value`}
                connectNulls={true}
                dot={this.props.settings.showPoints}
                activeDot={dotActive && {
                    stroke: '#444444',
                    onClick: (data: {payload: LinePoint}) => this.selectMeasurements(data, index)
                }}
                stroke={(this.props.settings.connectPoints ? color : '#00000000')}
                fill={color}>
                {showDeviation &&
                    <ErrorBar
                        dataKey={`data[${index}].range`}
                        stroke={DATASET_COLORS.getColor(index)}
                        strokeWidth={2} />
                }
            </Line>
        );
    }

    selectMeasurements = (data: {payload: LinePoint}, index: number) =>
    {
        this.props.onMeasurementsSelected(data.payload.data[index].group.measurements);
    }
}
