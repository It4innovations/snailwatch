import React, {PureComponent} from 'react';
import {CartesianGrid, ResponsiveContainer, Tooltip, XAxis,
    YAxis, Legend, LineChart as ReLineChart, Line} from 'recharts';
import {Measurement} from '../../../../lib/measurement/measurement';
import {GroupMode} from '../../../../lib/measurement/group-mode';
import {compareXValue, groupMeasurements, MeasurementGroup, formatXValue} from '../chart-utils';
import {ColorPalette} from '../../color-palette';
import {LineChartDataset} from './line-chart-dataset';
import {Tick} from '../tick';
import {Dictionary, chain, uniq, sort} from 'ramda';

interface Props
{
    views: LineChartDataset[];
    xAxis: string;
    groupMode: GroupMode;
    connectPoints: boolean;
    onMeasurementsSelected(measurements: Measurement[]): void;
}

interface LinePoint
{
    x: string;
    data: {
        group: MeasurementGroup | null;
        value: number | null;
    }[];
}

const DATASET_COLORS = new ColorPalette([
    '#DD0000',
    '#00DD00',
    '#0000DD',
    '#DD2288'
]);

export class LineChart extends PureComponent<Props>
{
    render()
    {
        if (this.props.views.length > 1 && this.props.groupMode === GroupMode.None)
        {
            return 'You have to use a group mode with multiple datasets';
        }

        const verticalPadding = 20;

        const datasets = this.props.views.map(v =>
            groupMeasurements(v.measurements, this.props.groupMode, this.props.xAxis, [v.yAxis])
        );
        const points = this.createLinePoints(datasets);

        return (
            <>
                <ResponsiveContainer width='98%' height={400}>
                    <ReLineChart data={points}>
                        <CartesianGrid stroke='#ccc' />
                        <XAxis
                            tick={props => <Tick {...props} />}
                            dataKey='x' />
                        <YAxis padding={{bottom: verticalPadding, top: verticalPadding}} />
                        <Tooltip />
                        <Legend />
                        {datasets.map((scatter, index) =>
                            <Line
                                key={index}
                                name={`Dataset ${this.props.views[index].name}`}
                                isAnimationActive={false}
                                dataKey={`data[${index}].value`}
                                connectNulls={true}
                                activeDot={{
                                    onClick: (data: {payload: LinePoint}) => this.selectMeasurements(data, index)
                                }}
                                stroke={(this.props.connectPoints ? DATASET_COLORS.getColor(index) : '#00000000')}
                                fill={DATASET_COLORS.getColor(index)} />
                        )}
                    </ReLineChart>
                </ResponsiveContainer>
            </>
        );
    }

    createLinePoints = (datasets: Dictionary<MeasurementGroup>[]): LinePoint[] =>
    {
        const keys = uniq(chain(d => Object.keys(d), datasets));
        const values = keys.map(x => ({
            x,
            data: datasets.map(d => {
                if (d.hasOwnProperty(x))
                {
                    return {
                        group: d[x],
                        value: d[x].items[Object.keys(d[x].items)[0]].average
                    };
                }

                return {
                    group: null,
                    value: null
                };
            })
        }));

        return sort((a, b) => compareXValue(a.x, b.x), values).map(val => ({
            ...val,
            x: formatXValue(val.x)
        }));
    }

    selectMeasurements = (data: {payload: LinePoint}, index: number) =>
    {
        this.props.onMeasurementsSelected(data.payload.data[index].group.measurements);
    }
}