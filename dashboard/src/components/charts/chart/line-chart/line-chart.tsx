import chroma from 'chroma-js';
import memoizeOne from 'memoize-one';
import {reduce} from 'ramda';
import React, {PureComponent, RefObject} from 'react';
import {Alert} from 'reactstrap';
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
import {SortMode} from '../sort-mode';
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
    sortMode: SortMode;
    chartRef?: RefObject<ReLineChart>;
    onMeasurementsSelected?(measurements: Measurement[]): void;
}

const DATASET_COLORS = new ColorPalette(chroma.brewer.Set1);

export class LineChart extends PureComponent<Props>
{
    private lineData = memoizeOne(
        (datasets: LineChartDataset[], groupMode: GroupMode, xAxis: string,
         dateFormat: string, showAverageTrend: boolean, sortMode: SortMode) =>
            createLineData(datasets, groupMode, xAxis,
                dateFormat, showAverageTrend, sortMode, DATASET_COLORS
            )
    );

    render()
    {
        if (this.props.datasets.length > 1 && this.props.groupMode === GroupMode.None)
        {
            return 'You have to use a group mode with multiple datasets';
        }

        let {points, groups} = this.lineData(this.props.datasets, this.props.groupMode, this.props.xAxis,
            this.props.dateFormat, this.props.settings.showAverageTrend, this.props.sortMode);

        let attributesMissing = false;
        const empty = points.length === 0;
        if (empty)
        {
            points = [{x: '', data: []}];
            const measurementLength = reduce((count, dataset) => count + dataset.measurements.length, 0,
                this.props.datasets);
            attributesMissing = measurementLength > 0;
        }

        return (
            <div>
                {attributesMissing && !this.props.preview &&
                <Alert color='warning'>
                    Some measurements are not displayed because of missing X or Y axis value.
                </Alert>}
                {this.renderChartWrapper(points, groups, empty, attributesMissing)}
            </div>
        );

    }
    renderChartWrapper = (points: LinePoint[], groups: LabeledGroup[],
                          empty: boolean, attributesMissing: boolean): JSX.Element =>
    {
        if (this.props.responsive)
        {
            return (
                <ResponsiveContainer width='100%' height={this.props.height}>
                    {this.renderChart(points, groups, empty, attributesMissing)}
                </ResponsiveContainer>
            );
        }

        return this.renderChart(points, groups, empty, attributesMissing);
    }
    renderChart = (points: LinePoint[], groups: LabeledGroup[],
                   empty: boolean, attributesMissing: boolean): JSX.Element =>
    {
        const preview = this.props.preview || false;
        const padding = preview ? 10 : 20;
        const yDomain: [AxisDomain, AxisDomain] = this.props.fitToDomain ? ['dataMin', 'auto'] : [0, 'auto'];

        // do not wrap the chart, it has to be a direct child of ResponsiveContainer
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
                    {empty && <Label value={attributesMissing ? 'Missing attributes' : 'No data available'}
                                     position='center' />}
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
