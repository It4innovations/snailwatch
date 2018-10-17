import chroma from 'chroma-js';
import memoizeOne from 'memoize-one';
import React, {PureComponent, RefObject} from 'react';
import {
    AxisDomain,
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
import {formatYAxis} from '../chart-utils';
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
    fitToDomain?: boolean;
    groupMode: GroupMode;
    settings: LineChartSettings;
    preview?: boolean;
    dateFormat: string;
    chartRef?: RefObject<ReLineChart>;
    onMeasurementsSelected?(measurements: Measurement[]): void;
}

const DATASET_COLORS = new ColorPalette(chroma.brewer.Set1);

export class LineChart extends PureComponent<Props>
{
    private lineData = memoizeOne(
        (datasets: LineChartDataset[], groupMode: GroupMode, xAxis: string,
         dateFormat: string, showAverageTrend: boolean) =>
            createLineData(datasets, groupMode, xAxis,
                dateFormat, showAverageTrend, DATASET_COLORS
            )
    );

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
        const padding = preview ? 10 : 20;

        let {points, groups} = this.lineData(this.props.datasets, this.props.groupMode, this.props.xAxis,
            this.props.dateFormat, this.props.settings.showAverageTrend);

        const empty = points.length === 0;
        if (empty)
        {
            points = [{x: '', data: []}];
        }

        const yDomain: [AxisDomain, AxisDomain] = this.props.fitToDomain ? ['dataMin', 'auto'] : [0, 'auto'];

        return (
            <ReLineChart data={points}
                         width={this.props.width}
                         height={this.props.height}
                         ref={this.props.chartRef}>
                <CartesianGrid stroke='#CCCCCC' />
                <XAxis
                    dataKey='x'
                    interval='preserveStartEnd'
                    tickLine={!preview}
                    tick={props => !this.props.preview && <Tick {...props} />}
                    padding={{left: padding, right: padding}}>
                    {empty && <Label value='No data available' position='center' />}
                </XAxis>
                <YAxis padding={{bottom: padding, top: padding}}
                       domain={yDomain}
                       tickFormatter={formatYAxis} />
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
        const settings = this.props.settings;
        const dotActive = this.props.onMeasurementsSelected && !preview && !group.isAverageTrend;
        const showErrorBars = !preview && settings.showErrorBars && !group.isAverageTrend;
        const showPoints = settings.showPoints && !group.isAverageTrend;
        const color = group.color;
        const connectPoints = settings.connectPoints || (group.isAverageTrend && settings.showAverageTrend);
        const stroke = connectPoints ? color : '#00000000';

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
                dot={showPoints}
                activeDot={dotActive && {
                    stroke: '#444444',
                    onClick: (data: {payload: LinePoint}) => this.selectMeasurements(data, index)
                }}
                stroke={stroke}
                fill={color}>
                {showErrorBars &&
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
